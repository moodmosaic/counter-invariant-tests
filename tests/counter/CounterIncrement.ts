import fc from "https://cdn.skypack.dev/fast-check@3.19.0";
import { Account, Tx } from "https://deno.land/x/clarinet@v1.8.0/index.ts";
import { Model, Real } from "./types.ts";

export const CounterIncrement = (accounts: Map<string, Account>) =>
  fc.record({
    sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
      account.address
    ),
  }).map((r: { sender: string }) => ({
    check: (model: Readonly<Model>) => true,
    run: (model: Model, real: Real) => {
      const block = real.chain.mineBlock([
        Tx.contractCall("counter", "increment", [], r.sender),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);

      model.counter = model.counter + 1;

      // deno-fmt-ignore
      console.log(`Ӿ tx-sender ${r.sender.padStart(41, " ")} ✓ ${"increment".padStart(11, " ")}`);
    },
    toString: () => `increment`,
  }));
