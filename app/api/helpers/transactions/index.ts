import { ethers } from 'ethers';
import NodeCache from 'node-cache';

import { constructExplorerURL } from '@/api/utils/blockchain';

import { VALID_SORT_ORDERS } from '@/api/utils/constants';

import { BlockchainKey } from '@/types/blockchain';
import { UserTransaction } from '@/types/transaction';

const txCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes by default
const endBlockCache = new NodeCache({ stdTTL: 600 }); // Cache to store the latest endBlock for each address

function generateCacheKey(
  address: string,
  chain: BlockchainKey,
  startBlock?: number,
  endBlock?: number
): string {
  return `${chain}-${address}-${startBlock}-${endBlock}`;
}

function setEndBlockForAddress(
  address: string,
  chain: BlockchainKey,
  endBlock: number
): void {
  const key = `${chain}-${address}`;
  endBlockCache.set(key, endBlock);
}

function getEndBlockForAddress(
  address: string,
  chain: BlockchainKey
): number | undefined {
  const key = `${chain}-${address}`;
  return endBlockCache.get<number>(key);
}

export async function getTransactionHistory(
  address: string,
  chain: BlockchainKey,
  startBlock?: number,
  endBlock?: number,
  sortOrder: (typeof VALID_SORT_ORDERS)[number] = VALID_SORT_ORDERS[0]
): Promise<UserTransaction[]> {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(address, chain, startBlock, endBlock);
    const cachedTransactions = txCache.get<UserTransaction[]>(cacheKey);

    let transactions: UserTransaction[] = [];

    if (cachedTransactions) {
      console.log(`[${new Date().toISOString()}] Fetching data from cache...`);
      transactions = [...cachedTransactions];
    } else {
      console.log(
        `[${new Date().toISOString()}] Fetching data from blockchain API...`
      );

      const currentEndBlock = getEndBlockForAddress(address, chain);
      if (endBlock && currentEndBlock && endBlock > currentEndBlock) {
        txCache.del(cacheKey); // Delete the older cached data
      }

      const url = constructExplorerURL(chain, {
        module: 'account',
        action: 'txlist',
        address: address,
        startBlock: startBlock?.toString() || undefined,
        endBlock: endBlock?.toString() || undefined,
        sort: sortOrder,
      });

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.message !== 'OK') {
        throw new Error('Error fetching data from explorer.');
      }

      transactions = result.result.map((tx: any) => {
        const isOutgoing = tx.from.toLowerCase() === address.toLowerCase();
        let amountInEth = parseFloat(ethers.formatEther(tx.value));

        const amountString =
          amountInEth % 1 === 0
            ? amountInEth.toString()
            : amountInEth.toFixed(8);

        return {
          txnHash: tx.hash,
          timestamp: parseInt(tx.timeStamp),
          from: tx.from,
          to: tx.to,
          amountInEth: amountString,
          direction: isOutgoing ? 'out' : 'in',
        };
      });

      // After successfully fetching and before caching
      if (endBlock) {
        setEndBlockForAddress(address, chain, endBlock);
      }

      txCache.set(cacheKey, transactions);
    }
    return transactions;
  } catch (err) {
    throw new Error('Error while parsing data from the explorer.');
  }
}
