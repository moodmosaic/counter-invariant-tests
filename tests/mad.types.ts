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
import fc from "fast-check";

export interface ContractFunction {
  name: string;
  access: "public" | "private" | "read_only";
  args: any[];
  outputs: object;
}

export type TupleData<T extends ClarityValue = ClarityValue> = {
  [key: string]: T;
};

export type BaseType = "int128" | "uint128" | "bool" | "principal";

export type ComplexType =
  | { buffer: { length: number } }
  | { "string-ascii": { length: number } }
  | { "string-utf8": { length: number } }
  | { list: { type: ArgType; length: number } }
  | { tuple: { name: string; type: ArgType }[] }
  | { optional: ArgType }
  | { response: { ok: ArgType; error: ArgType } };

export type ArgType = BaseType | ComplexType;

export type ArbitraryType =
  | ReturnType<typeof fc.integer>
  | ReturnType<typeof fc.nat>
  | ReturnType<typeof fc.boolean>
  | ((addresses: any[]) => ReturnType<typeof fc.constantFrom>)
  | ReturnType<typeof fc.string>
  | ((maxLength: number) => ReturnType<typeof fc.asciiString>)
  | ((maxLength: number) => ReturnType<typeof fc.string>);

export type BaseTypesToFcType = {
  int128: ReturnType<typeof fc.integer>;
  uint128: ReturnType<typeof fc.nat>;
  bool: ReturnType<typeof fc.boolean>;
  // principal: (addresses: any[]) => ReturnType<typeof fc.constantFrom>;
};

export type ComplexTypesToFcType = {
  buffer: (length: number) => fc.Arbitrary<string>;
  "string-ascii": (length: number) => fc.Arbitrary<string>;
  "string-utf8": (length: number) => fc.Arbitrary<string>;
  list: (type: ArgType, length: number) => fc.Arbitrary<any[]>;
  tuple: (items: { name: string; type: ArgType }[]) => fc.Arbitrary<object>;
  optional: (type: ArgType) => fc.Arbitrary<any>;
  response: (okType: ArgType, errType: ArgType) => fc.Arbitrary<any>;
};

export type BaseTypesToCvType = {
  int128: (arg: number) => ReturnType<typeof intCV>;
  uint128: (arg: number) => ReturnType<typeof uintCV>;
  bool: (arg: boolean) => ReturnType<typeof boolCV>;
  principal: (arg: string) => ReturnType<typeof principalCV>;
};

export type ComplexTypesToCvType = {
  buffer: (arg: string) => ReturnType<typeof bufferCV>;
  "string-ascii": (arg: string) => ReturnType<typeof stringAsciiCV>;
  "string-utf8": (arg: string) => ReturnType<typeof stringUtf8CV>;
  list: (type: ClarityValue[]) => ReturnType<typeof listCV>;
  tuple: (tupleData: TupleData) => ReturnType<typeof tupleCV>;
  optional: (arg: ClarityValue | null) => ReturnType<typeof optionalCVOf>;
  response: (
    status: "ok" | "error",
    value: ClarityValue
  ) => ReturnType<typeof responseOkCV | typeof responseErrorCV>;
};
