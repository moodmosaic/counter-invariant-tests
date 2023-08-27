import {
  CounterCommand,
  Principal,
  Real,
  Stub,
} from "./CounterCommandModel.ts";

import { Tx } from "https://deno.land/x/clarinet@v1.7.1/index.ts";

export class CounterIncrementCommand implements CounterCommand {
  readonly sender: Principal;

  constructor(
    sender: Principal,
  ) {
    this.sender = sender;
  }

  check(_: Readonly<Stub>): boolean {
    return true;
  }

  run(model: Stub, real: Real): void {
    const block = real.chain.mineBlock([
      Tx.contractCall(
        "counter",
        "increment",
        [],
        this.sender.value,
      ),
    ]);
    block
      .receipts[0]
      .result
      .expectOk()
      .expectBool(true);

    model.counter = model.counter + 1;

    console.log(
      `Ӿ tx-sender ${this.sender.value.padStart(41, " ")} ✓ ${
        "increment".padStart(11, " ")
      }`,
    );
  }

  toString() {
    return `increment`;
  }
}
