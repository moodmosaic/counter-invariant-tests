import {
  CounterCommand,
  Principal,
  Real,
  Stub,
  Uint,
} from "./CounterCommandModel.ts";

import { Tx } from "https://deno.land/x/clarinet@v1.7.1/index.ts";

export class CounterAddCommand implements CounterCommand {
  readonly number: Uint;
  readonly sender: Principal;

  constructor(
    number: Uint,
    sender: Principal,
  ) {
    this.number = number;
    this.sender = sender;
  }

  check(_: Readonly<Stub>): boolean {
    return this.number.value > 1;
  }

  run(model: Stub, real: Real): void {
    const block = real.chain.mineBlock([
      Tx.contractCall(
        "counter",
        "add",
        [this.number.clarityValue()],
        this.sender.value,
      ),
    ]);
    block
      .receipts[0]
      .result
      .expectOk()
      .expectBool(true);

    model.counter = model.counter + this.number.value;

    console.log(
      `Ӿ tx-sender ${this.sender.value.padStart(41, " ")} ✓ ${
        "add".padStart(11, " ")
      } ${this.number.value.toString().padStart(10, " ")}`,
    );
  }

  toString() {
    return `add ${this.number.value}`;
  }
}
