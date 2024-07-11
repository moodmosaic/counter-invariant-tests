import fc from "fast-check";
import { ArgType, ContractFunction } from "./mad.types";

import { ComplexTypesToFcType, BaseTypesToFcType } from "./mad.types";

/** For a given function, dynamically generate fast-check arbitraries.
 * @param fn ContractFunction
 * @returns Array of fast-check arbitraries
 */
export const generateArbitrariesForFunction = (
  fn: ContractFunction
): fc.Arbitrary<any>[] => {
  return fn.args.map((arg) => {
    return generateArbitrary(arg.type as ArgType);
  });
};

/**
 * For a given type, generate a fast-check arbitrary.
 * @param type
 * @returns fast-check arbitrary
 */
const generateArbitrary = (type: ArgType): fc.Arbitrary<any> => {
  if (typeof type === "string") {
    // The type is a base type
    return baseTypesToFC[type];
  } else {
    // The type is a complex type
    if ("buffer" in type) {
      return complexTypesToFC["buffer"](type.buffer.length);
    } else if ("string-ascii" in type) {
      return complexTypesToFC["string-ascii"](type["string-ascii"].length);
    } else if ("string-utf8" in type) {
      return complexTypesToFC["string-utf8"](type["string-utf8"].length);
    } else if ("list" in type) {
      return complexTypesToFC["list"](type.list.type, type.list.length);
    } else if ("tuple" in type) {
      return complexTypesToFC["tuple"](type.tuple);
    } else if ("optional" in type) {
      return complexTypesToFC["optional"](type.optional);
    } else if ("response" in type) {
      return complexTypesToFC.response(type.response.ok, type.response.error);
    } else {
      throw new Error(`Unsupported complex type: ${JSON.stringify(type)}`);
    }
  }
};

/**
 * Base types to fast-check arbitraries mapping.
 */
const baseTypesToFC: BaseTypesToFcType = {
  int128: fc.integer(),
  uint128: fc.nat(),
  bool: fc.boolean(),
  // principal: (addresses: string[]) => fc.constantFrom(addresses),
};

/**
 * Complex types to fast-check arbitraries mapping.
 */
const complexTypesToFC: ComplexTypesToFcType = {
  buffer: (length: number) => fc.hexaString({ maxLength: length }),
  "string-ascii": (length: number) => fc.asciiString({ maxLength: length }),
  "string-utf8": (length: number) => fc.string({ maxLength: length }),
  list: (type: ArgType, length: number) =>
    fc.array(generateArbitrary(type), { maxLength: length }),
  tuple: (items: { name: string; type: ArgType }[]) => {
    const tupleArbitraries: { [key: string]: fc.Arbitrary<any> } = {};
    items.forEach((item) => {
      tupleArbitraries[item.name] = generateArbitrary(item.type);
    });
    return fc.record(tupleArbitraries);
  },
  optional: (type: ArgType) => fc.option(generateArbitrary(type)),
  response: (okType: ArgType, errType: ArgType) =>
    fc.oneof(
      fc.record({
        status: fc.constant("ok"),
        value: generateArbitrary(okType),
      }),
      fc.record({
        status: fc.constant("error"),
        value: generateArbitrary(errType),
      })
    ),
};
