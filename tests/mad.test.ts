import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";
import fc from "fast-check";
import { beforeAll, afterAll, it, describe } from "vitest";
import { ContractFunction } from "./mad.types";
import { generateArbitrariesForFunction } from "./fcConvertors";
import { argsToCV } from "./cvConvertors";
import { cvToJSON } from "@stacks/transactions";

import fs from "fs";
import path from "path";

const sutPath = path.resolve(__dirname, "../contracts/adder.clar");
const madPath = path.resolve(__dirname, "../tests/adder_mad.clar");
const sutClar = fs.readFileSync(sutPath, "utf8");
const madClar = fs.readFileSync(madPath, "utf8");

const getContractFunctions = (
  network: Simnet,
  sutContracts: string[]
): Map<string, ContractFunction[]> => {
  const scInterfaces = network.getContractsInterfaces();
  const sutContractsFunctions: Map<string, any> = new Map();
  let sutContractsCallableFns: Map<string, ContractFunction[]> = new Map();

  sutContracts.forEach((c) => {
    sutContractsFunctions.set(c, scInterfaces.get(c)?.functions);
  });

  sutContractsFunctions.forEach((fns: ContractFunction[], c: string) => {
    sutContractsCallableFns.set(
      c,
      fns.filter((fn) => fn.access === "public" || fn.access === "read_only")
    );
  });

  return sutContractsCallableFns;
};

const getSUTFunctions = (
  sutContracts: string[],
  allPublicFunctions: Map<string, ContractFunction[]>
): Map<string, ContractFunction[]> => {
  const sutFunctions = new Map();
  sutContracts.forEach((c) => {
    sutFunctions.set(
      c,
      allPublicFunctions
        .get(c)
        ?.filter((fn) => fn.access === "public" && !fn.name.includes("mad"))
    );
  });

  return sutFunctions;
};

const getContractInvariants = (
  sutContracts: string[],
  sutContractsFunctions: Map<string, any>
) => {
  const invariants = new Map();
  sutContracts.forEach((c) => {
    invariants.set(
      c,
      sutContractsFunctions.get(c).filter((fn: any) => fn.name.includes("mad"))
    );
  });

  return invariants;
};

const sutContracts: string[] = [
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.adder_mad",
];

describe("mad contract tests", () => {
  let simnet;
  beforeAll(async () => {
    fs.writeFileSync(madPath, `${sutClar}\n${madClar}`);
    simnet = await initSimnet();
  });

  afterAll(async () => {
    fs.writeFileSync(madPath, `${madClar}`);
  });

  it("run invariant testing", () => {
    const allSCFunctions = getContractFunctions(simnet, sutContracts);
    const sutFunctions = getSUTFunctions(sutContracts, allSCFunctions);
    const availableInvariants = getContractInvariants(
      sutContracts,
      allSCFunctions
    );

    const allFunctions: ContractFunction[] = Array.from(
      sutFunctions.values()
    ).flat();
    const allInvariants: ContractFunction[] = Array.from(
      availableInvariants.values()
    ).flat();

    fc.assert(
      // fc.property(fc.constantFrom(...allFunctions), (fn) => {
      fc.property(fc.constantFrom(...allFunctions), (fn) => {
        // Generate random arguments for the chosen function
        const argsArb = fc.tuple(...generateArbitrariesForFunction(fn));
        return fc.assert(
          fc.property(argsArb, (args) => {
            const functionArgs = argsToCV(fn, args);
            console.log(allFunctions[0].args);
            // Call the chosen function with the generated arguments
            simnet.callPublicFn(
              // We know that we have only one contract
              sutContracts[0],
              fn.name,
              functionArgs,
              "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
            );
            let printedArgs: string = "";
            args.forEach((arg) => {
              printedArgs += `${arg} `;
            });
            console.log(fn.name, printedArgs);
            // Call and check all invariants after each function call
            allInvariants.forEach((invariant) => {
              const { result: testInvariant } = simnet.callReadOnlyFn(
                // We know that we have only one contract
                sutContracts[0],
                invariant.name,
                [],
                "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
              );
              const jsonResult = cvToJSON(testInvariant);
              // @ts-ignore
              if (!jsonResult.value) {
                throw new Error(
                  `Invariant failed: "${invariant.name}" returned ${jsonResult.value}`
                );
              }
            });
          }),
          { verbose: true, numRuns: 100 }
        );
      })
    );
  });
});
