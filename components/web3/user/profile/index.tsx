'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import WalletCard from '@/components/web3/user/card';
import Dropdown from '@/components/shared/dropdown';
import UserTransactions from '@/components/web3/user/transactions';
import SearchBar from '@/components/shared/search';
import DirectionBadge from '@/components/shared/badge/direction';

import { useLatestBlock } from '@/hooks/useLatestBlock';
import { useWalletDetails } from '@/hooks/useWalletDetails';

import { blockchains } from '@/utils/constants/blockchains';
import { removeTrailingZeros } from '@/utils/removeTrailingZeros';

import { Blockchain, BlockchainKey } from '@/types/blockchain';
import { Styles } from '@/types/styles';
import { ApiResponse } from '@/types/api';
import { UserTransaction } from '@/types/transaction';

import { formatTimestamp } from '@/utils/formatTimestamp';

const styles: Styles = {
  sectionContainer: `flex flex-col xl:mx-auto mt-5 mb-[30px] sm:mb-[60px] px-4 md:px-8 w-full max-width`,
  bgGradient: `absolute inset-x-0 top-[60px] sm:top-[150px] flex items-center justify-center before:h-[300px] before:sm:w-[480px] before:w-[140px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:sm:w-[240px] after:w-[140px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] pointer-events-none`,
  sectionHeader: `sm:text-center mt-6 mb-8 lg:mb-12 bg-gradient-to-br from-white to-stone-500 bg-clip-text font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[5rem] font-bold sm:tracking-[-0.02em] text-transparent drop-shadow-sm [text-wrap:balance]`,
  walletWrapper: `flex items-center sm:justify-center mb-6 sm:mb-8 sm:mb-14`,
  optionsContainer: `flex flex-col sm:flex-row gap-3 lg:gap-4 w-full`,
  dropdownContainer: `sm:max-w-[220px] lg:max-w-[300px]`,
  searchItemWrapper: `flex items-center px-2 py-2 group-hover:bg-secondary/[6%] overflow-hidden smooth-transition rounded-lg`,
  searchItem: `group px-1.5 py-1.5 sm:py-2 sm:px-2 block`,
  searchItemBadge: `flex items-center justify-center gap-2  h-full shrink-0`,
  searchItemContent: `flex justify-between w-full pl-2 gap-4 overflow-hidden`,
  searchItemHashTime: `flex flex-col gap-1 sm:gap-1.5 overflow-hidden`,
  searchItemHash: `max-w-[600px] truncate text-secondary/60 font-mono text-sm md:text-base`,
  searchItemTime: `truncate text-sm md:text-base text-secondary/40 font-display`,
  searchItemAmount: `flex items-center gap-1.5 sm:gap-2 text-secondary/60 px-2 md:px-4 text-sm sm:text-base`,
  searchItemIcon: `w-3.5 h-3.5 sm:h-4 sm:w-4`,
};

// Maximum search result to show in the search dropdown result
const MAX_RESULT_COUNT = 10;

const enum SearchTypes {
  hash = 'txnHash',
  amount = 'amount',
  default = 'txnHash',
}

interface SearchOption {
  value: SearchTypes;
  label: string;
}

interface SearchItemProps {
  item: UserTransaction;
  blockchain: Blockchain;
}

interface TransactionSearchProps {
  loading: boolean;
  blockchain: Blockchain;
  addressHash: string;
  endBlock: number | null;
}

const searchOptions: SearchOption[] = [
  { value: SearchTypes.hash, label: 'Transaction Hash' },
  { value: SearchTypes.amount, label: 'Amount' },
];

const SearchItem: React.FC<SearchItemProps> = ({ item, blockchain }) => {
  const { txnHash, amountInEth, direction, timestamp } = item;
  const { Icon, name } = blockchain;

  const timeString = formatTimestamp(timestamp);

  return (
    <a
      aria-label="link-on-chain-explorer"
      href={`/transactions/${name}/${txnHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.searchItem}
    >
      <div className={styles.searchItemWrapper}>
        <div className={styles.searchItemBadge}>
          <DirectionBadge isLoading={false} type={direction} full />
        </div>

        <div className={styles.searchItemContent}>
          <div className={styles.searchItemHashTime}>
            <span className={styles.searchItemHash}>{txnHash}</span>
            <span className={styles.searchItemTime}>{timeString}</span>
          </div>

          <div className={styles.searchItemAmount}>
            <Icon className={styles.searchItemIcon} />
            {removeTrailingZeros(amountInEth)}
          </div>
        </div>
      </div>
    </a>
  );
};

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  loading,
  blockchain,
  addressHash,
  endBlock,
}) => {
  const [searchBy, setSearchBy] = useState<SearchTypes | string>(
    SearchTypes.default
  );

  const handleDropdown = (selected: { value: SearchTypes | string }) => {
    setSearchBy(selected.value);
  };

  const onSearch = async (
    query: string
  ): Promise<ApiResponse<UserTransaction[]>> => {
    const endpoint = `/api/user/${addressHash}/transactions/search?chain=${blockchain.name}&startBlock=0&endBlock=${endBlock}&type=${searchBy}&value=${query}&limit=${MAX_RESULT_COUNT}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data;
  };

  return (
    <div className={styles.optionsContainer}>
      <Dropdown
        label="Search by"
        options={searchOptions}
        value={searchBy}
        onSelect={handleDropdown}
        classNames={{ container: styles.dropdownContainer }}
        disabled={loading}
      />

      <SearchBar
        onSearch={onSearch}
        disabled={loading || !searchBy}
        placeholder={loading ? 'Loading...' : 'Search transactions...'}
        SearchItem={(props) => (
          <SearchItem blockchain={blockchain} {...props} />
        )}
      />
    </div>
  );
};

export default function UserProfile() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  const chain = parts[0];
  const addressHash = parts[2];

  const blockchain = blockchains[chain as BlockchainKey];

  const walletDetails = useWalletDetails(addressHash, chain);
  const { latestBlock } = useLatestBlock(chain);

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.bgGradient}></div>

      <h1 className={styles.sectionHeader}>Wallet Transactions</h1>

      <div className={styles.walletWrapper}>
        <WalletCard
          walletDetails={walletDetails}
          addressHash={addressHash}
          blockchain={blockchain}
        />
      </div>

      <TransactionSearch
        loading={walletDetails.loading}
        blockchain={blockchain}
        addressHash={addressHash}
        endBlock={latestBlock}
      />

      <UserTransactions
        addressHash={addressHash}
        blockchain={blockchain}
        endBlock={latestBlock}
      />
    </section>
  );
}
