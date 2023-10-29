export type TransactionType = {
  txnHash: string;
  amountInEth: string;
  amountInUsd: string;
  blockNumber: number | null;
  timestamp: number | null;
  from: string;
  to: string;
  txnFeeInEth: string;
  txnFeeInUSD: string;
  gasPriceInGwei: string;
  gasFeeInEth: string;
  status: 'pending' | 'success' | 'failed';
};

export type UserTransaction = {
  txnHash: string;
  timestamp: number | null;
  from: string;
  to: string;
  amountInEth: string;
  direction: 'in' | 'out';
};
