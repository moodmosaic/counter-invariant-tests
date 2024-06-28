import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";
import {
  boolCV,
  bufferCV,
  cvToJSON,
  intCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  uintCV,
} from "@stacks/transactions";
import fc from "fast-check";
import { it } from "vitest";
import {
  BaseType,
  BaseTypesReflexionCV,
  BaseTypesReflexionFC,
  ContractFunction,
} from "./mad.types";
const simnet = await initSimnet();

const baseTypesReflexionFC: BaseTypesReflexionFC = {
  "int128": fc.integer(),
  "uint128": fc.nat(),
  "bool": fc.boolean(),
  "principal": (addresses: string[]) => fc.constantFrom(addresses),
  "buffer": fc.string(),
  "string-ascii": (maxLength: number) => fc.asciiString({ maxLength }),
  "string-utf8": (maxLength: number) => fc.string({ maxLength }),
};

const baseTypesReflexionCV: BaseTypesReflexionCV = {
  "int128": (arg: number) => intCV(arg),
  "uint128": (arg: number) => uintCV(arg),
  "bool": (arg: boolean) => boolCV(arg),
  "principal": (arg: string) => principalCV(arg),
  "buffer": (arg: Uint8Array) => bufferCV(arg),
  "string-ascii": (arg: string) => stringAsciiCV(arg),
  "string-utf8": (arg: string) => stringUtf8CV(arg),
};

// TODO: complex types
// const typesReflexion = {
//   list: (type: BaseType, maxLength: number) => {
//     const baseTypeArbitrary = baseTypesReflexion[type];

//     if (typeof baseTypeArbitrary === "function") {
//       if (type === "principal") {
//         return (addresses: any[]) =>
//           fc.array(baseTypeArbitrary(addresses), { maxLength });
//       } else {
//         // Assume maxLength function for "string-ascii" and "string-utf8"
//         return fc.array(baseTypeArbitrary(maxLength), { maxLength });
//       }
//     }

//     return fc.array(baseTypeArbitrary as fc.Arbitrary<any>, { maxLength });
//   },
//   "tuple": "",
//   "optional": "", // fc.option
//   "response": "",
// };

const getContractFunctions = (
  network: Simnet,
  sutContracts: string[],
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
      fns.filter((fn) => fn.access === "public"),
    );
  });

  return sutContractsCallableFns;
};

const getSUTFunctions = (
  sutContracts: string[],
  allPublicFunctions: Map<string, ContractFunction[]>,
): Map<string, ContractFunction[]> => {
  const sutFunctions = new Map();
  sutContracts.forEach((c) => {
    sutFunctions.set(
      c,
      allPublicFunctions.get(c)?.filter((fn) => !fn.name.includes("mad")),
    );
  });

  return sutFunctions;
};

const getContractInvariants = (
  sutContracts: string[],
  sutContractsFunctions: Map<string, any>,
) => {
  const invariants = new Map();
  sutContracts.forEach((c) => {
    invariants.set(
      c,
      sutContractsFunctions.get(c).filter((fn: any) => fn.name.includes("mad")),
    );
  });

  return invariants;
};

const argsToCV = (fn: ContractFunction, args: any[]) => {
  const cvArgs: any[] = fn.args.map((arg, i) => {
    // @ts-ignore
    return baseTypesReflexionCV[arg.type as BaseType](args[i]);
  });

  return cvArgs;
};

const sutContracts: string[] = [
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.adder_mad",
];

it("run invariant testing", () => {
  const allSCFunctions = getContractFunctions(simnet, sutContracts);
  const sutFunctions = getSUTFunctions(
    sutContracts,
    allSCFunctions,
  );
  const availableInvariants = getContractInvariants(
    sutContracts,
    allSCFunctions,
  );

  // Helper function to generate arguments based on the function argument types
  const generateArguments = (fn: ContractFunction) => {
    return fn.args.map((arg) => {
      const arb = baseTypesReflexionFC[arg.type as BaseType];
      if (typeof arb === "function") {
        return arb(arg.maxLength); // Provide maxLength or addresses if needed
      }
      return arb;
    });
  };

  const allFunctions: ContractFunction[] = Array.from(
    sutFunctions.values(),
  ).flat();
  const allInvariants: ContractFunction[] = Array.from(
    availableInvariants.values(),
  ).flat();

  fc.assert(fc.property(fc.constantFrom(...allFunctions), (fn) => {
    // Generate random arguments for the chosen function
    const argsArb = fc.tuple(...generateArguments(fn));
    return fc.assert(
      fc.property(argsArb, (args) => {
        const functionArgs = argsToCV(fn, args);

        // Call the chosen function with the generated arguments
        simnet.callPublicFn(
          // We know that we have only one contract
          sutContracts[0],
          fn.name,
          functionArgs,
          "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        );
        let printedArgs: string = "";
        args.forEach((arg) => {
          printedArgs += `${arg} `;
        });
        console.log(fn.name, printedArgs);

        // Call and check all invariants after each function call
        allInvariants.forEach((invariant) => {
          const { result: testInvariant } = simnet.callPublicFn(
            // We know that we have only one contract
            sutContracts[0],
            invariant.name,
            [],
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          );
          const jsonResult = cvToJSON(testInvariant);

          // @ts-ignore
          if (!jsonResult.success) {
            throw new Error(`Invariant failed ${jsonResult.value.value}`);
          }
        });
      }),
      { verbose: true, numRuns: 100 },
    );
  }));
});
