import { useState, useEffect } from 'react';

interface UseLatestBlockResult {
  latestBlock: number | null;
  error: string | null;
}

/**
 * Custom hook to fetch the latest block for a specific chain.
 *
 * @param {string} chain - The blockchain chain to fetch the latest block for.
 * @returns {UseLatestBlockResult} An object containing the latest block and any potential errors.
 */
export function useLatestBlock(chain: string): UseLatestBlockResult {
  const [latestBlock, setLatestBlock] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const fetchLatestBlock = async () => {
      try {
        const response = await fetch(`/api/block/latest?chain=${chain}`, {
          signal: controller.signal,
        });

        const { success, data, error } = await response.json();

        if (success && isSubscribed) {
          setLatestBlock(data.latestBlock);
        } else {
          setError(error);
        }
      } catch (e) {
        let err = e as Error;

        if (err.name === 'AbortError') return;
        console.log('Error while fetching latest block', err.message);
      }
    };

    if (chain) {
      fetchLatestBlock();
    }

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [chain]);

  return { latestBlock, error };
}
