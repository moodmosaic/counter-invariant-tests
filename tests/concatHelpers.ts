import { Simnet } from "@hirosystems/clarinet-sdk";
import fs from "fs";
import path from "path";

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

  // Concatenate the two contracts contents
  const concatContractContent = concatContractSrcs(
    sutContract,
    invariantsContract
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
const concatContractSrcs = (sutContract, invariantsContract): string =>
  sutContract + "\n\n" + invariantsContract;

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

const invariantPath = path.resolve(__dirname, "../contracts");
