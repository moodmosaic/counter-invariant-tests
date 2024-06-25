#!/bin/bash

# Set necessary variables
contract="../../contracts/counter.clar"
initial_allocations="./initial-balances.json"
contract_addr="SPP5ERW9P30ZQ9S7KGEBH042E7EJHWDT2Z5K086D"
contract_id="$contract_addr.counter"
tx_sender="S1G2081040G2081040G2081040G208105NK8PE5"
specific_test="$1"

echo "$specific_test"

# Ensure clarity-cli is in the PATH
command -v clarity-cli >/dev/null 2>&1 || {
    echo >&2 "No clarity-cli in PATH"
    exit 1
}

# Function to run a specific test
run_test() {
    local test_name="$1"
    local test_dir="$2"
    printf "Run test: %s\n" "$test_name"

    local result
    #  TODO: run with args
    result=$(clarity-cli execute "$test_dir" "$contract_id" "$test_name" "$tx_sender" u1 2>&1)
    local rc=$?
    printf "result: %s\n" "$result"
    if [[ $rc -ne 0 ]] || grep -q '^Aborted: ' <<< "$result"; then
        echo "Test $test_name failed"
        exit 1
    fi
}

# Main loop to process each contract test file
ls ./test-*.clar
for contract_test in ./test-*.clar; do
    echo "Contract test: $contract_test"
    if [[ -n "$specific_test" ]] && [[ "$contract_test" != "$specific_test" ]]; then
        echo "Skipping $contract_test difference ($contract_test - $specific_test)"
        continue
    fi

    test_dir="/tmp/vm-counter-$(basename "$contract_test").db"
    [[ -d "$test_dir" ]] && rm -rf "$test_dir"

    # Initialize the test environment
    clarity-cli initialize --testnet "$initial_allocations" "$test_dir"

    # Prepare the combined contract file
    echo "Tests begin at line $(wc -l < "$contract")"
    cat "$contract" "$contract_test" > "$test_dir/contract-with-tests.clar"

    # Launch the contract
    echo "Instantiate $contract_id"
    clarity-cli launch "$contract_id" "$test_dir/contract-with-tests.clar" "$test_dir"

    # Execute and list tests
    echo "Run tests"
    tests=$(clarity-cli execute "$test_dir" "$contract_id" "list-tests" "$tx_sender" 2>&1 |
        jq -r '.events[] | select(.contract_event.topic == "print") | .contract_event.value.Sequence.String.ASCII.data | implode | ltrimstr("test: ")')

    echo "$tests"
    set -- $tests

    # Run each test
    for test_name; do
        run_test "$test_name" "$test_dir"
    done
done