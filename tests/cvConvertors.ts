import {
  boolCV,
  bufferCV,
  ClarityValue,
  intCV,
  listCV,
  optionalCVOf,
  principalCV,
  responseErrorCV,
  responseOkCV,
  stringAsciiCV,
  stringUtf8CV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import {
  ArgType,
  BaseTypesToCvType,
  ComplexTypesToCvType,
  ContractFunction,
  isBaseType,
  TupleData,
} from "./mad.types";

/**
 * Convert function arguments to Clarity values.
 * @param fn ContractFunction
 * @param args Array of arguments
 * @returns Array of Clarity values
 */
export const argsToCV = (fn: ContractFunction, args: any[]) => {
  return fn.args.map((arg, i) => argToCV(args[i], arg.type as ArgType));
};

/**
 * Convert a function argument to a Clarity value.
 * @param arg Generated argument
 * @param type Argument type (base or complex)
 * @returns Clarity value
 */
const argToCV = (arg: any, type: ArgType): ClarityValue => {
  if (isBaseType(type)) {
    // Base type
    switch (type) {
      case "int128":
        return baseTypesToCV.int128(arg as number);
      case "uint128":
        return baseTypesToCV.uint128(arg as number);
      case "bool":
        return baseTypesToCV.bool(arg as boolean);
      case "principal":
        return baseTypesToCV.principal(arg as string);
      default:
        throw new Error(`Unsupported base type: ${type}`);
    }
  } else {
    // Complex type
    if ("buffer" in type) {
      return complexTypesToCV.buffer(arg);
    } else if ("string-ascii" in type) {
      return complexTypesToCV["string-ascii"](arg);
    } else if ("string-utf8" in type) {
      return complexTypesToCV["string-utf8"](arg);
    } else if ("list" in type) {
      const listItems = arg.map((item: any) => argToCV(item, type.list.type));
      return complexTypesToCV.list(listItems);
    } else if ("tuple" in type) {
      // Handle tuples
      const tupleData: { [key: string]: ClarityValue } = {};
      type.tuple.forEach((field) => {
        tupleData[field.name] = argToCV(arg[field.name], field.type);
      });
      return complexTypesToCV.tuple(tupleData);
    } else if ("optional" in type) {
      return optionalCVOf(arg ? argToCV(arg, type.optional) : undefined);
    } else if ("response" in type) {
      const status = arg.status;
      const branchType = type.response[status];
      const responseValue = argToCV(arg.value, branchType);
      return complexTypesToCV.response(status, responseValue);
    } else {
      throw new Error(`Unsupported complex type: ${JSON.stringify(type)}`);
    }
  }
};

/**
 * Base types to Clarity values mapping.
 */
const baseTypesToCV: BaseTypesToCvType = {
  int128: (arg: number) => intCV(arg),
  uint128: (arg: number) => uintCV(arg),
  bool: (arg: boolean) => boolCV(arg),
  principal: (arg: string) => principalCV(arg),
};

/**
 * Complex types to Clarity values mapping.
 */
const complexTypesToCV: ComplexTypesToCvType = {
  buffer: (arg: string) => bufferCV(Uint8Array.from(Buffer.from(arg, "hex"))),
  "string-ascii": (arg: string) => stringAsciiCV(arg),
  "string-utf8": (arg: string) => stringUtf8CV(arg),
  list: (items: ClarityValue[]) => {
    return listCV(items);
  },
  tuple: (tupleData: TupleData<ClarityValue>) => {
    return tupleCV(tupleData);
  },
  optional: (arg: ClarityValue | null) =>
    arg ? optionalCVOf(arg) : optionalCVOf(undefined),
  response: (status: "ok" | "error", value: ClarityValue) => {
    if (status === "ok") return responseOkCV(value);
    else if (status === "error") return responseErrorCV(value);
    else throw new Error(`Unsupported response status: ${status}`);
  },
};
