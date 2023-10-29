import { useState, useEffect } from 'react';

interface WalletDetails {
  balance: number;
  txnCount: number;
}

interface UseWalletDetailsResult {
  data: WalletDetails | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch wallet details for a given address and chain.
 *
 * @param {string} addressHash - The wallet address hash.
 * @param {string} chain - The blockchain chain to fetch details for.
 * @returns {UseWalletDetailsResult} An object containing the wallet details, loading state, and any potential errors.
 */
export function useWalletDetails(
  addressHash: string,
  chain: string
): UseWalletDetailsResult {
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const fetchWalletDetails = async () => {
      try {
        const response = await fetch(
          `/api/user/${addressHash}/balance?chain=${chain}`,
          {
            signal: controller.signal,
          }
        );
        const { success, data, error } = await response.json();

        if (success && isSubscribed) {
          setWalletDetails(data);
          setLoading(false);
        } else {
          setError(error);
        }
      } catch (e) {
        let err = e as Error;
        if (err.name === 'AbortError') return;
        console.log('Error fetching wallet details', err.message);
      }
    };

    if (addressHash && chain) {
      fetchWalletDetails();
    }

    return () => {
      controller.abort();
    };
  }, [addressHash, chain]);

  return {
    loading,
    data: walletDetails,
    error,
  };
}
