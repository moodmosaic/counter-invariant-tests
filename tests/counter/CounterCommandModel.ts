// @ts-nocheck FIXME
// https://github.com/dubzzz/fast-check/issues/2781
import fc from "https://cdn.skypack.dev/fast-check@3.12.0";

import { Chain, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";

export type Stub = {
  counter: number;
};

export type Real = {
  chain: Chain;
};

export type CounterCommand = fc.Command<Stub, Real>;

//
// Interop: Clarity <-> TypeScript
//

export class Uint {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  clarityValue(): string {
    return types.uint(this.value);
  }
}

export class Principal {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  clarityValue(): string {
    return types.principal(this.value);
  }
}
