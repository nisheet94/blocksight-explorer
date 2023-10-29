export type BlockchainKey = 'ethereum' | 'polygon';

export interface Blockchain {
  name: string;
  network: string;
  currency: string;
  Icon: React.ComponentType<{ className?: string }>;
  explorer_url: string;
  // ...
}

export type Blockchains = {
  [key in BlockchainKey]: Blockchain;
};
