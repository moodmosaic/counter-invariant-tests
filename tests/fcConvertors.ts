import fc from "fast-check";
import { ArgType, ContractFunction } from "./rv.types";

import { ComplexTypesToFcType, BaseTypesToFcType } from "./rv.types";

/** The character set used for generating ASCII strings.*/
const charSet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

/** For a given function, dynamically generate fast-check arbitraries.
 * @param fn ContractFunction
 * @returns Array of fast-check arbitraries
 */
export const generateArbitrariesForFunction = (
  fn: ContractFunction,
  addresses: string[]
): fc.Arbitrary<any>[] => {
  return fn.args.map((arg) => {
    return generateArbitrary(arg.type as ArgType, addresses);
  });
};

/**
 * For a given type, generate a fast-check arbitrary.
 * @param type
 * @returns fast-check arbitrary
 */
const generateArbitrary = (
  type: ArgType,
  addresses: string[]
): fc.Arbitrary<any> => {
  if (typeof type === "string") {
    // The type is a base type
    if (type === "principal") {
      if (addresses.length === 0)
        throw new Error(
          "No addresses could be retrieved from the simnet instance!"
        );
      return baseTypesToFC.principal(addresses);
    } else return baseTypesToFC[type];
  } else {
    // The type is a complex type
    if ("buffer" in type) {
      return complexTypesToFC["buffer"](type.buffer.length);
    } else if ("string-ascii" in type) {
      return complexTypesToFC["string-ascii"](type["string-ascii"].length);
    } else if ("string-utf8" in type) {
      return complexTypesToFC["string-utf8"](type["string-utf8"].length);
    } else if ("list" in type) {
      return complexTypesToFC["list"](
        type.list.type,
        type.list.length,
        addresses
      );
    } else if ("tuple" in type) {
      return complexTypesToFC["tuple"](type.tuple, addresses);
    } else if ("optional" in type) {
      return complexTypesToFC["optional"](type.optional, addresses);
    } else if ("response" in type) {
      return complexTypesToFC.response(
        type.response.ok,
        type.response.error,
        addresses
      );
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
  principal: (addresses: string[]) => fc.constantFrom(...addresses),
};

/**
 * Complex types to fast-check arbitraries mapping.
 */
const complexTypesToFC: ComplexTypesToFcType = {
  buffer: (length: number) => fc.hexaString({ maxLength: length }),
  "string-ascii": (length: number) =>
    fc.stringOf(fc.constantFrom(...charSet), {
      maxLength: length,
      minLength: 1,
    }),
  "string-utf8": (length: number) => fc.string({ maxLength: length }),
  list: (type: ArgType, length: number, addresses: string[]) =>
    fc.array(generateArbitrary(type, addresses), { maxLength: length }),
  tuple: (items: { name: string; type: ArgType }[], addresses: string[]) => {
    const tupleArbitraries: { [key: string]: fc.Arbitrary<any> } = {};
    items.forEach((item) => {
      tupleArbitraries[item.name] = generateArbitrary(item.type, addresses);
    });
    return fc.record(tupleArbitraries);
  },
  optional: (type: ArgType, addresses: string[]) =>
    fc.option(generateArbitrary(type, addresses)),
  response: (okType: ArgType, errType: ArgType, addresses: string[]) =>
    fc.oneof(
      fc.record({
        status: fc.constant("ok"),
        value: generateArbitrary(okType, addresses),
      }),
      fc.record({
        status: fc.constant("error"),
        value: generateArbitrary(errType, addresses),
      })
    ),
};
