import {
  chainConfig,
  VALID_SEARCH_TYPES,
  VALID_SORT_ORDERS,
  VALID_SORT_TYPES,
} from '@/api/utils/constants';
import { BlockchainKey } from '@/types/blockchain';

export function isValidChain(chain: string): chain is BlockchainKey {
  return chain in chainConfig;
}

export function isValidAddress(value: string, chain: BlockchainKey): boolean {
  const config = chainConfig[chain].address;

  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const addressRegex = new RegExp(
    `^${config.hashPrefix}[a-fA-F0-9]{${
      config.hashLength - config.hashPrefix.length
    }}$`
  );
  return addressRegex.test(value);
}

export function isValidBlock(block: string | null): boolean {
  if (block === null) return false;

  const blockNumber = Number(block);
  return (
    !isNaN(blockNumber) && Number.isInteger(blockNumber) && blockNumber >= 0
  );
}

export function isValidSortBy(
  value: string
): value is (typeof VALID_SORT_TYPES)[number] {
  return VALID_SORT_TYPES.includes(value as any);
}

export function isValidSortOrder(
  value: string
): value is (typeof VALID_SORT_ORDERS)[number] {
  return VALID_SORT_ORDERS.includes(value as any);
}

export function isValidNumber(numericString: string | null): boolean {
  if (numericString === null) return false;

  const numberValue = Number(numericString);
  return (
    !isNaN(numberValue) && Number.isInteger(numberValue) && numberValue >= 0
  );
}

export function isValidLimit(limitString: string | null): boolean {
  if (limitString === null) return true;

  const limit = Number(limitString);
  return !isNaN(limit) && Number.isInteger(limit) && limit > 0 && limit < 100;
}

export function isValidSearchType(
  value: string | null
): value is (typeof VALID_SEARCH_TYPES)[number] {
  return VALID_SEARCH_TYPES.includes(value as any);
}

export function isValidHash(
  value: string | null,
  chain: BlockchainKey
): boolean {
  if (!value) return false;

  const config = chainConfig[chain].transaction;

  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const hashRegex = new RegExp(
    `^${config.hashPrefix}[a-fA-F0-9]{${
      config.hashLength - config.hashPrefix.length
    }}$`
  );
  return hashRegex.test(value);
}

/**
 * Checks if a string is a valid partial transaction hash for the specified chain.
 * @param {string} value - The string to validate.
 * @param {string} chain - The blockchain chain name.
 * @returns {boolean} - True if the string is a valid partial hash, false otherwise.
 */
export function isPartialHash(
  value: string | null,
  chain: BlockchainKey
): boolean {
  if (!value) return false;

  const config = chainConfig[chain];

  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return (
    value.startsWith(config.transaction.hashPrefix) &&
    value.length > config.transaction.hashPrefix.length &&
    value.length < config.transaction.hashLength
  );
}

export function isValidAmount(
  value: string | null,
  chain: BlockchainKey
): boolean {
  const config = chainConfig[chain];

  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const amount = Number(value);

  // Check if the value is a valid number and positive
  if (isNaN(amount) || amount <= 0) {
    return false;
  }

  // Check against max supply if it exists in the config
  if (config.maxSupply && amount > config.maxSupply) {
    return false;
  }

  return true;
}
