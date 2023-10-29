import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import TransactionDetails from '@/components/web3/transaction/details';

import { blockchains } from '@/utils/constants/blockchains';

import { BlockchainKey } from '@/types/blockchain';
import { Styles } from '@/types/styles';
import { ApiResponse } from '@/types/api';
import { TransactionType } from '@/types/transaction';

const styles: Styles = {
  sectionContainer: `relative flex flex-col xl:mx-auto mt-5 mb-[60px] sm:mb-[120px] px-5 sm:px-6 md:px-8 w-full max-width`,
  sectionHeader: `mt-6 mb-8 lg:mb-12 bg-gradient-to-br from-white to-stone-500 bg-clip-text font-display text-4xl md:text-5xl md:leading-[5rem] font-bold tracking-[-0.02em] text-transparent drop-shadow-sm [text-wrap:balance]`,
  loaderWrapper: `absolute inset-0 flex items-center justify-center`,
  loader: `cp-spinner cp-flip`,
};

export default function TransactionOverview() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  const chain = parts[1];
  const addressHash = parts[2];

  const blockchain = blockchains[chain as BlockchainKey];

  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `/api/transaction/${addressHash}?chain=${chain}`
        );
        const result: ApiResponse<TransactionType> = await response.json();

        if (result.success) {
          setTransaction(result.data);
        } else {
          setError(result.error.code);
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    if (addressHash) fetchPosts();
  }, [addressHash, chain]);

  return (
    <section className={styles.sectionContainer}>
      <h1 className={styles.sectionHeader}>Transaction Details</h1>

      {loading ? (
        <div className="flex grow pt-[15vh] justify-center">
          <div className={styles.loader}></div>
        </div>
      ) : !transaction ? (
        <div>{error}</div>
      ) : (
        <TransactionDetails transaction={transaction} blockchain={blockchain} />
      )}
    </section>
  );
}

// const FetchError: React.FC<{ errorMessage: string }> = ({ errorMessage }) => {
//   return (
//     <div className={styles.errorContainer}>
//       <p>Error fetching transaction: {errorMessage}</p>
//     </div>
//   );
// };
