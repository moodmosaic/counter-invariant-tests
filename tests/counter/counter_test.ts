import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v1.8.0/index.ts";

// https://github.com/hirosystems/clarity-starter/blob/aa4a7e31a73ab8bb23a813d92598d5eba8876d1c/tests/counter_test.ts

Clarinet.test({
  name: "ensure <get-counter> send the counter value",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "get-counter", [], address),
    ]);

    block.receipts[0].result.expectUint(0);
  },
});

Clarinet.test({
  name: "ensure <increment> adds 1",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "increment", [], address),
      Tx.contractCall("counter", "get-counter", [], address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectUint(1);
  },
});

Clarinet.test({
  name: "ensure <decrement> removes 1",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "increment", [], address),
      Tx.contractCall("counter", "decrement", [], address),
      Tx.contractCall("counter", "get-counter", [], address),
    ]);

    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectUint(0);
  },
});

Clarinet.test({
  name: "ensure <decrement> throws an error if result is lower than 0",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "decrement", [], address),
    ]);

    block.receipts[0].result.expectErr().expectUint(401);
  },
});

Clarinet.test({
  name: "ensure <add> adds up the right amout",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "add", [types.uint(3)], address),
      Tx.contractCall("counter", "get-counter", [], address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectUint(3);
  },
});

Clarinet.test({
  name: "ensure <add> throws an error if n is too low",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("counter", "add", [types.uint(1)], address),
    ]);

    block.receipts[0].result.expectErr().expectUint(402);
  },
});

import fc from "https://cdn.skypack.dev/fast-check@3.19.0";

import { CounterAdd } from "./CounterAdd.ts";
import { CounterAddError } from "./CounterAddError.ts";
import { CounterDecrement } from "./CounterDecrement.ts";
import { CounterDecrementError } from "./CounterDecrementError.ts";
import { CounterGet } from "./CounterGet.ts";
import { CounterIncrement } from "./CounterIncrement.ts";

Clarinet.test({
  name: "invariant tests",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const invariants = [
      CounterAdd(accounts),
      CounterAddError(accounts),
      CounterDecrement(accounts),
      CounterDecrementError(accounts),
      CounterGet(accounts),
      CounterIncrement(accounts),
    ];

    const model = {
      counter: 0,
    };

    fc.assert(
      fc.property(
        fc.commands(invariants, { size: "+1" }),
        (cmds: []) => {
          const state = () => ({ model: model, real: { chain } });
          fc.modelRun(state, cmds);
        },
      ),
      { numRuns: 100, verbose: true },
    );
  },
});
