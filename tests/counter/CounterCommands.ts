import { Account } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { Principal, Uint } from "./CounterCommandModel.ts";

import fc from "https://cdn.skypack.dev/fast-check@3.12.0";

import { CounterAddCommand } from "./CounterAddCommand.ts";
import { CounterAddErrorCommand } from "./CounterAddErrorCommand.ts";
import { CounterDecrementCommand } from "./CounterDecrementCommand.ts";
import { CounterDecrementErrorCommand } from "./CounterDecrementErrorCommand.ts";
import { CounterGetCommand } from "./CounterGetCommand.ts";
import { CounterIncrementCommand } from "./CounterIncrementCommand.ts";

export function CounterCommands(accounts: Map<string, Account>) {
  const allCommands = [
    // CounterAddCommand
    fc
      .record({
        number: fc.integer(),
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { number: number; sender: string }) =>
        new CounterAddCommand(
          new Uint(
            r.number,
          ),
          new Principal(
            r.sender,
          ),
        )
      ),

    // CounterAddErrorCommand
    fc
      .record({
        number: fc.integer({ min: 0, max: 2 }),
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { number: number; sender: string }) =>
        new CounterAddErrorCommand(
          new Uint(
            r.number,
          ),
          new Principal(
            r.sender,
          ),
        )
      ),

    // CounterDecrementCommand
    fc
      .record({
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { sender: string }) =>
        new CounterDecrementCommand(
          new Principal(
            r.sender,
          ),
        )
      ),

    // CounterDecrementErrorCommand
    fc
      .record({
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { sender: string }) =>
        new CounterDecrementErrorCommand(
          new Principal(
            r.sender,
          ),
        )
      ),

    // CounterGetCommand
    fc
      .record({
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { sender: string }) =>
        new CounterGetCommand(
          new Principal(
            r.sender,
          ),
        )
      ),

    // CounterIncrementCommand
    fc
      .record({
        sender: fc.constantFrom(...accounts.values()).map((account: Account) =>
          account.address
        ),
      })
      .map((r: { sender: string }) =>
        new CounterIncrementCommand(
          new Principal(
            r.sender,
          ),
        )
      ),
  ];
  // On size: https://github.com/dubzzz/fast-check/discussions/2978
  return fc.commands(allCommands, { size: "+1" });
}
