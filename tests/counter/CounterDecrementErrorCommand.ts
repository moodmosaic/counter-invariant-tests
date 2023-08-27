import {
  CounterCommand,
  Principal,
  Real,
  Stub,
} from "./CounterCommandModel.ts";

import { Tx } from "https://deno.land/x/clarinet@v1.7.1/index.ts";

export class CounterDecrementErrorCommand implements CounterCommand {
  readonly sender: Principal;

  constructor(
    sender: Principal,
  ) {
    this.sender = sender;
  }

  check(model: Readonly<Stub>): boolean {
    return model.counter < 1;
  }

  run(_: Stub, real: Real): void {
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
      .expectErr()
      .expectUint(401);

    console.log(
      `Ӿ tx-sender ${this.sender.value.padStart(41, " ")}  ✓ ${
        "decrement".padStart(11, " ")
      } ERR_COUNTER_MUST_BE_POSITIVE`,
    );
  }

  toString() {
    return `decrement`;
  }
}
