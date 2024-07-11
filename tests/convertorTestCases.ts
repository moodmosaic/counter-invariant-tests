import { ContractFunction } from "./mad.types";

// Example ContractFunction and call to generateArguments
export const complexFn: ContractFunction = {
  name: "exampleFunction",
  access: "public",
  args: [
    { name: "int", type: "int128" },
    { name: "uint", type: "uint128" },
    { name: "bool", type: "bool" },
    { name: "bufferedData", type: { buffer: { length: 100 } } },
    { name: "asciiString", type: { "string-ascii": { length: 10 } } },
    { name: "uintList", type: { list: { type: "uint128", length: 10 } } },
    { name: "boolList", type: { list: { type: "bool", length: 10 } } },
    {
      name: "tuple",
      type: {
        tuple: [
          { name: "m", type: "uint128" },
          { name: "n", type: { list: { type: "uint128", length: 100 } } },
        ],
      },
    },
    {
      name: "nestedTuple",
      type: {
        tuple: [
          { name: "m", type: "uint128" },
          {
            name: "n",
            type: {
              list: {
                type: {
                  list: {
                    type: {
                      list: {
                        type: { "string-ascii": { length: 10 } },
                        length: 2,
                      },
                    },
                    length: 2,
                  },
                },
                length: 2,
              },
            },
          },
        ],
      },
    },
    { name: "simpleOptional", type: { optional: "bool" } },
    {
      name: "complexOptional",
      type: { optional: { list: { type: "bool", length: 100 } } },
    },
    {
      name: "responseBoolBool",
      type: { response: { ok: "bool", error: "bool" } },
    },
    {
      name: "responseBoolUint",
      type: { response: { ok: "bool", error: "uint128" } },
    },
  ],
  outputs: {},
};
