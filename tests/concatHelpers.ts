import { Simnet } from "@hirosystems/clarinet-sdk";
import fs from "fs";
import path from "path";

/**
 * The context contract that will be concatenated with the SUT and the invariants contracts.
 * It is a map that stores the number of times each SUT function is called.
 */
const contextContract = `(define-map context (string-ascii 100) {
    called: uint
    ;; other data
})

(define-public (update-context (function-name (string-ascii 100)) (called uint))
    (ok (map-set context function-name {called: called})))

(update-context "create-new-shipment" u0)`;

/**
 * Concatenate the SUT and the invariants contracts, then deploy the concatenated contract.
 * @param network
 * @param sutContractName
 * @param sender
 * @param deployer
 * @returns Concatenated contract name in the format "deployer.contractName".
 */
export const concatAndDeployContract = (
  network: Simnet,
  sutContractName: string,
  sender: string,
  deployer: string
): string => {
  // Get the invariants contract name
  const invariantScName = invariantScNamingRule(sutContractName);

  // Get each contract's content
  const { sutContract, invariantsContract } = getSutAndInvariantsContractsSrcs(
    network,
    sutContractName,
    invariantScName
  );

  // Concatenate the two contracts contents and the context contract
  const concatContractContent = concatContractSrcs(
    sutContract,
    invariantsContract,
    contextContract
  );

  const concatContractName = `${getScNameFromFullAddress(
    sutContractName
  )}_concat`;

  // Deploy the concatenated contract
  network.deployContract(
    concatContractName,
    concatContractContent,
    { clarityVersion: 2 },
    sender
  );

  return `${deployer}.${concatContractName}`;
};

/**
 * Get the SUT and the invariants contracts' sources.
 * @param network
 * @param sutContractName
 * @param invariantsContractName
 * @returns SUT and invariants contracts' sources.
 */
const getSutAndInvariantsContractsSrcs = (
  network: Simnet,
  sutContractName: string,
  invariantsContractName: string
) => {
  const sutContract = getContractSrc(network, sutContractName);
  const invariantsContract = getInvariantContractSrc(invariantsContractName);
  return { sutContract, invariantsContract };
};

/**
 * Get the SUT contract source.
 * @param network
 * @param contractName
 * @returns
 */
const getContractSrc = (network: Simnet, contractName: string) =>
  network.getContractSource(contractName);

/**
 * Get the invariant contract source.
 * @param contractName
 * @returns Invariant contract source.
 */
const getInvariantContractSrc = (contractName: string): string =>
  fs.readFileSync(`${invariantPath}/${contractName}.clar`).toString();

/**
 * Concatenate the SUT and the invariant contracts' sources.
 * @param sutContract
 * @param invariantsContract
 * @returns Concatenated contract sources.
 */
const concatContractSrcs = (
  sutContract,
  invariantsContract,
  contextContract
): string =>
  sutContract + "\n\n" + invariantsContract + "\n\n" + contextContract;

/**
 * Get the invariant contract name considering the naming rule for the invariants.
 * @param contractName
 * @returns Invariant contract name.
 */
const invariantScNamingRule = (contractName: string): string =>
  getScNameFromFullAddress(contractName) + "_mad";

/**
 * Get the contract name from the format "contractAddress.contractName".
 * @param contractAddressAndName
 * @returns Contract name.
 */
const getScNameFromFullAddress = (contractAddressAndName: string): string =>
  contractAddressAndName.split(".")[1];

const invariantPath = path.resolve("./tests");
