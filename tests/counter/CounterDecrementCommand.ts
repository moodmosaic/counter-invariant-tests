import {
  CounterCommand,
  Principal,
  Real,
  Stub,
} from "./CounterCommandModel.ts";

import { Tx } from "https://deno.land/x/clarinet@v1.7.1/index.ts";

export class CounterDecrementCommand implements CounterCommand {
  readonly sender: Principal;

  constructor(
    sender: Principal,
  ) {
    this.sender = sender;
  }

  check(model: Readonly<Stub>): boolean {
    return model.counter > 0;
  }

  run(model: Stub, real: Real): void {
    const block = real.chain.mineBlock([
      Tx.contractCall(
        "counter",
        "decrement",
        [],
        this.sender.value,
      ),
    ]);
    block
      .receipts[0]
      .result
      .expectOk()
      .expectBool(true);

    model.counter = model.counter - 1;

    console.log(
      `Ӿ tx-sender ${this.sender.value.padStart(41, " ")} ✓ ${
        "decrement".padStart(11, " ")
      }`,
    );
  }

  toString() {
    return `decrement`;
  }
}
