import fc from "https://cdn.skypack.dev/fast-check@3.19.0";
import { Account } from "https://deno.land/x/clarinet@v1.8.0/index.ts";
import { Model, Real } from "./types.ts";

export const CounterGet = (accounts: Map<string, Account>) =>
  fc.record({
    sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
      account.address
    ),
  }).map((r: { sender: string }) => ({
    check: (model: Readonly<Model>) => model.counter > 0,
    run: (model: Model, real: Real) => {
      real.chain.callReadOnlyFn("counter", "get-counter", [], r.sender).result
        .expectUint(model.counter);

      // deno-fmt-ignore
      console.log(`Ӿ tx-sender ${r.sender.padStart(41, " ")} ✓ ${"get-counter".padStart(11, " ")}`);
    },
    toString: () => `get-counter`,
  }));
