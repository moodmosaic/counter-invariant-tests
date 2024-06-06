import fc from "https://cdn.skypack.dev/fast-check@3.19.0";
import { Account, Tx } from "https://deno.land/x/clarinet@v1.8.0/index.ts";
import { Model, Real } from "./types.ts";

export const CounterDecrementError = (accounts: Map<string, Account>) =>
  fc.record({
    sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
      account.address
    ),
  }).map((r: { sender: string }) => ({
    check: (model: Readonly<Model>) => model.counter < 0,
    run: (model: Model, real: Real) => {
      const block = real.chain.mineBlock([
        Tx.contractCall("counter", "decrement", [], r.sender),
      ]);
      block.receipts[0].result.expectErr().expectUint(403);

      // deno-fmt-ignore
      console.log(`Ӿ tx-sender ${r.sender.padStart(41, " ")} ✓ ${"decrement".padStart(11, " ")} ERR_COUNTER_MUST_BE_POSITIVE`);
    },
    toString: () => `decrement`,
  }));
