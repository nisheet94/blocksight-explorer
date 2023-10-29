import { BlockchainKey } from '@/types/blockchain';

type ChainConfigType = {
  [key in BlockchainKey]: {
    transaction: {
      hashPrefix: string;
      hashLength: number;
    };
    address: {
      hashPrefix: string;
      hashLength: number;
    };
    maxSupply?: number; // some chains may not have a max supply.
  };
  // And, so on ...
};

export const chainConfig: ChainConfigType = {
  ethereum: {
    transaction: {
      hashPrefix: '0x',
      hashLength: 66,
    },
    address: {
      hashPrefix: '0x',
      hashLength: 42,
    },
    maxSupply: undefined, // Ethereum doesn't have a capped supply
  },
  polygon: {
    transaction: {
      hashPrefix: '0x',
      hashLength: 66,
    },
    address: {
      hashPrefix: '0x',
      hashLength: 42,
    },
    maxSupply: 10000000000, // 10 billion MATIC
  },
  // And, so on ...
};

// Add more as necessary ...
export const VALID_SEARCH_TYPES = ['txnHash', 'amount'] as const;

export const VALID_SORT_TYPES = ['timestamp', 'amount'] as const;
export const VALID_SORT_ORDERS = ['desc', 'asc'] as const;
