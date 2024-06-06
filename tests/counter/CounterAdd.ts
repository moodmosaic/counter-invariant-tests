import fc from "https://cdn.skypack.dev/fast-check@3.19.0";
import {
  Account,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v1.8.0/index.ts";
import { Model, Real } from "./types.ts";

export const CounterAdd = (accounts: Map<string, Account>) =>
  fc.record({
    number: fc.integer(),
    sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
      account.address
    ),
  }).map((r: { number: number; sender: string }) => ({
    check: (model: Readonly<Model>) => r.number > 1,
    run: (model: Model, real: Real) => {
      const block = real.chain.mineBlock([
        Tx.contractCall("counter", "add", [types.uint(r.number)], r.sender),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);

      model.counter = model.counter + r.number;

      // deno-fmt-ignore
      console.log(`Ӿ tx-sender ${r.sender.padStart(41, " ")} ✓ ${"add".padStart(11, " ")} ${r.number.toString().padStart(10, " ")}`);
    },
    toString: () => `add ${r.number}`,
  }));
