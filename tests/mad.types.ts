import fc from "fast-check";

export interface ContractFunction {
  name: string;
  access: "public" | "private" | "read_only";
  args: any[];
  outputs: object;
}

export type BaseType =
  | "int128"
  | "uint128"
  | "bool"
  | "principal"
  | "buffer"
  | "string-ascii"
  | "string-utf8";

export type ArbitraryType =
  | ReturnType<typeof fc.integer>
  | ReturnType<typeof fc.nat>
  | ReturnType<typeof fc.boolean>
  | ((addresses: any[]) => ReturnType<typeof fc.constantFrom>)
  | ReturnType<typeof fc.string>
  | ((maxLength: number) => ReturnType<typeof fc.asciiString>)
  | ((maxLength: number) => ReturnType<typeof fc.string>);

export type BaseTypesReflexionFC = {
  int128: ReturnType<typeof fc.integer>;
  uint128: ReturnType<typeof fc.nat>;
  bool: ReturnType<typeof fc.boolean>;
  principal: (addresses: any[]) => ReturnType<typeof fc.constantFrom>;
  buffer: ReturnType<typeof fc.string>;
  "string-ascii": (maxLength: number) => ReturnType<typeof fc.asciiString>;
  "string-utf8": (maxLength: number) => ReturnType<typeof fc.string>;
};
