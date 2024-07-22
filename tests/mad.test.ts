import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";
import { it } from "vitest";
import { ContractFunction, LocalContext } from "./mad.types";
import { generateArbitrariesForFunction } from "./fcConvertors";
import { argsToCV } from "./cvConvertors";
import { Cl, cvToJSON } from "@stacks/transactions";
import { concatAndDeployContract } from "./concatHelpers";
import fc from "fast-check";

// TODO: Import this for battle testing the fast-check and Clarity Values convertors.
// import { complexFn } from "./convertorTestCases";

const simnet = await initSimnet();

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
        ?.filter(
          (fn) =>
            fn.access === "public" &&
            !fn.name.includes("mad") &&
            fn.name !== "update-context"
        )
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
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.adder",
];

it("run invariant testing", () => {
  const deployerAddr = simnet.getAccounts().get("deployer")!;
  const concatContracts = sutContracts.map((c: string) =>
    concatAndDeployContract(simnet, c, deployerAddr, deployerAddr)
  );

  const allSCFunctions = getContractFunctions(simnet, concatContracts);
  const sutFunctions = getSUTFunctions(concatContracts, allSCFunctions);
  const availableInvariants = getContractInvariants(
    concatContracts,
    allSCFunctions
  );

  const allFunctions: ContractFunction[] = Array.from(
    sutFunctions.values()
  ).flat();
  const allInvariants: ContractFunction[] = Array.from(
    availableInvariants.values()
  ).flat();

  // Retrieve all the addresses from the simnet
  const networkAddresses: string[] = Array.from(simnet.getAccounts().values());

  // Initialize the local context
  const localContext: LocalContext = {};

  allFunctions.forEach((fn) => {
    localContext[fn.name] = 0;
  });

  // Initialize the Clarity context
  allFunctions.forEach((fn) => {
    const { result: initialize } = simnet.callPublicFn(
      concatContracts[0],
      "update-context",
      [Cl.stringAscii(fn.name), Cl.uint(0)],
      deployerAddr
    );
    const jsonResult = cvToJSON(initialize);
    if (!jsonResult.value || !jsonResult.success) {
      throw new Error(
        `Failed to initialize the context for function: ${fn.name}`
      );
    }
  });

  fc.assert(
    fc.property(fc.constantFrom(...allFunctions), (fn) => {
      // Generate random arguments for the chosen function
      const argsArb = fc.tuple(
        ...generateArbitrariesForFunction(fn, networkAddresses)
      );
      return fc.assert(
        fc.property(argsArb, (args) => {
          const functionArgs = argsToCV(fn, args);

          // Call the chosen function with the generated arguments
          const { result: sutCall } = simnet.callPublicFn(
            // FIXME: For the moment we know that we have only one contract. To be abstracted.
            concatContracts[0],
            fn.name,
            functionArgs,
            deployerAddr
          );
          let printedArgs: string = "";

          args.forEach((arg) => {
            printedArgs += `${arg} `;
          });
          // Print the called function and its arguments
          console.log(fn.name, printedArgs);

          const sutCallJson = cvToJSON(sutCall);

          if (sutCallJson.success) {
            // Update the local context for the called function
            localContext[fn.name] += 1;

            // Update the Clarity context for the called function
            simnet.callPublicFn(
              concatContracts[0],
              "update-context",
              [Cl.stringAscii(fn.name), Cl.uint(localContext[fn.name])],
              deployerAddr
            );
          }

          // Call and check all invariants after each function call
          allInvariants.forEach((invariant) => {
            const { result: testInvariant } = simnet.callReadOnlyFn(
              // FIXME: For the moment we know that we have only one contract. To be abstracted.
              concatContracts[0],
              invariant.name,
              [],
              deployerAddr
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

  // // TODO: Use this for battle testing the fast-check and Clarity Values convertors.
  // // New test cases can be added to the convertorTestCases.ts file and imported here.

  // // Functionality checker used to test the convertors
  // fc.assert(
  //   fc.property(fc.constantFrom(...[complexFn]), (fn) => {
  //     // Generate random arguments for the chosen function
  //     const argsArb = fc.tuple(
  //       ...generateArbitrariesForFunction(fn, networkAddresses)
  //     );
  //     return fc.assert(
  //       fc.property(argsArb, (args) => {
  //         console.log("fc generated arguments:\n", args);
  //         console.log(
  //           "--------------------------------------------------\nClarity Arguments:"
  //         );
  //         const functionArgs = argsToCV(fn, args);
  //         functionArgs.forEach((arg) => {
  //           console.log(JSON.stringify(cvToJSON(arg), null, 1));
  //         });
  //         console.log("--------------------------------------------------");
  //         // console.log("functionArgs:::", JSON.stringify(functionArgs, null, 2));
  //       }),
  //       { verbose: true, numRuns: 100, endOnFailure: true }
  //     );
  //   })
  // );
});
