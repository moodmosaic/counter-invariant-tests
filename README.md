# ClarFuzz

`ClarFuzz` is an early-stage Clarity Smart Contracts fuzzer. Leveraging the concept of `invariant testing` and the [fast-check](`https://github.com/dubzzz/fast-check`) `property testing` library, `ClarFuzz` is able to fuzz any Clarity smart contract. Moreover, its approach removes the need of keeping track of the contract's simplified model in TypeScript.

## How to Run

To run the fuzzer, follow these steps:

1. Install the required dependencies:
    ```console
    npm i
    ```
2. Start fuzzing smart contracts:
   ```console
   npx vitest run ./tests/mad.test.ts
   ```

Please note that this fuzzer is still under development and its approach is subject of future improvements and modifications.
