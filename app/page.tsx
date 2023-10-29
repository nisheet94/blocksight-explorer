'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Dropdown from '@/components/shared/dropdown';
import StatusBadge from '@/components/shared/badge/status';

import { blockchains } from '@/utils/constants/blockchains';

import { RedirectIcon, SearchIcon } from '@/components/shared/icons';

import { Styles } from '@/types/styles';
import { Status } from '@/utils/constants/status';
import { parseAddress } from '@/utils/parseAddress';
import { BlockchainKey } from '@/types/blockchain';

const styles: Styles = {
  bgGradient: `absolute inset-x-0 top-[60px] sm:top-[150px] flex items-center justify-center before:h-[300px] before:sm:w-[480px] before:w-[140px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:sm:w-[240px] after:w-[140px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] pointer-events-none`,
  heroContainer: `flex flex-col items-center mt-5 mb-[60px] sm:mb-[120px] max-width w-full px-4 overflow-hidden mx-auto`,
  heroHeader: `py-12 bg-gradient-to-br from-white to-stone-500 bg-clip-text font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm [text-wrap:balance] leading-normal`,
  walletAddressLabel: `flex flex-col-reverse sm:flex-row-reverse gap-4 max-w-[900px] w-full`,
  walletAddressInput: `flex grow items-center justify-center px-4 lg:px-6 h-[56px] sm:h-[66px] w-full font-display text-secondary/60 tracking-wide dark:bg-secondary/[8%] border-t-[1.5px] dark:border-secondary/[5%] focus-within:ring-4 dark:focus-within:ring-secondary/[4%] rounded-lg 2md:rounded-xl outline-none smooth-transition placeholder:tracking-wide placeholder-secondary/40 placeholder:tracking-wide disabled:cursor-not-allowed`,
  searchIcon: `h-6 w-6`,
  getTxnButton: `flex items-center justify-center gap-2 px-6 py-3 mt-8 bg-gradient-to-r from-secondary/60 to-gray-300 text-primary hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed smooth-transition rounded-xl text-xl font-medium cursor-pointer drop-shadow-lg`,
  quickLinks: `mt-10 flex flex-col gap-4 w-full`,
  quickLinksHeader: `text-xl text-center font-display tracking-tight text-secondary/40`,
  addressList: `flex flex-col md:flex-row gap-4 mt-4 items-center justify-center`,
  transactionList: `flex flex-col md:flex-row gap-4 mt-4 items-center justify-center`,
  transactionItem: `w-full max-w-[400px]`,
  transactionLink: `bg-red-100/10 group relative flex flex-col gap-4 px-4 sm:px-6 py-3 sm:py-4 dark:bg-secondary/[4%] border-t-[1.5px] dark:border-secondary/[5%] rounded-xl`,
  redirectIcon: `absolute top-5 right-5 h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 opacity-0 group-hover:opacity-40 text-secondary smooth-transition`,
  blockchainWrapper: `flex items-center gap-1.5 sm:gap-2.5`,
  blockchainIcon: `h-3.5 w-3.5 sm:h-4 sm:w-4`,
  blockchainName: `capitalize font-display text-lg sm:text-xl text-secondary/60`,
  transactionDetails: `flex flex-col text-secondary/40 text-sm sm:text-base`,
  transactionMessage: `italic`,
  transactionHash: `font-mono text-blue-500`,
  transactionStatus: `flex items-center gap-2`,
  transactionStatusText: `sm:text-lg text-secondary/40`,
};

const dropdownOptions = Object.entries(blockchains).map(
  ([key, blockchain]) => ({
    value: blockchain.name,
    label: blockchain.name,
  })
);

type SampleTransaction = {
  type: Status;
  message?: string;
  link?: string;
  hash?: string;
};

interface BlockchainData {
  name: BlockchainKey;
  addressLink: string;
  transactions: SampleTransaction[];
}

const blockchainData: BlockchainData[] = [
  {
    name: 'ethereum',
    addressLink: '0xa1619bDa3F5160d19dF5F9358F76A3E9BC893Ed6',
    transactions: [
      {
        type: Status.SUCCESS,
        hash: '0xcabe84f331c3493658c844c439e7722a7a75d3079f1d305bb4e17481ebc770e0',
      },
      {
        type: Status.FAILED,
        hash: '0xeec4ccd13fe05907f9d732a8ad245bcb7f918217157b89baaa23895c12eb329a',
      },
      {
        type: Status.PENDING,
        message: 'Fetch from Etherscan',
        link: 'https://etherscan.io/txsPending',
      },
    ],
  },
  {
    name: 'polygon',
    addressLink: '0x65ac1E192F37e08ba2D65086D80BFA2e1FE4Ff6A',
    transactions: [
      {
        type: Status.SUCCESS,
        hash: '0x6c466b113f6570e68d2d8a4d72e004fe461cb6fff3e39f17efd7f6afcf955b49',
      },
      {
        type: Status.FAILED,
        hash: '0x183b36cee2297696a2ca432555456bae8d6e2f45533276d017b5b76c3f82e277',
      },
      {
        type: Status.PENDING,
        message: 'Fetch from Polygonscan',
        link: 'https://polygonscan.com/txsPending',
      },
    ],
  },
  // ...
];

const QuickLinks: React.FC = () => {
  return (
    <div className={styles.quickLinks}>
      <span className={styles.quickLinksHeader}>Quick Links</span>

      {/* User address quick links */}
      <ul className={styles.addressList}>
        {blockchainData.map((blockchain, i) => {
          const { Icon, name } = blockchains[blockchain.name];
          return (
            <li key={i} className={styles.transactionItem}>
              <a
                aria-label="link-on-chain-explorer"
                href={`/${name}/address/${blockchain.addressLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.transactionLink}
              >
                <RedirectIcon className={styles.redirectIcon} />

                <div className={styles.blockchainWrapper}>
                  <Icon className={styles.blockchainIcon} />
                  <span className={styles.blockchainName}>{name}</span>
                </div>

                <div className={styles.transactionDetails}>
                  <p className={styles.transactionMessage}>
                    Sample User Address
                  </p>
                  <span className={styles.transactionHash}>
                    {parseAddress(blockchain.addressLink)}
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Transaction quick links*/}
      {blockchainData.map((blockchain) => {
        const { Icon, name } = blockchains[blockchain.name];

        return (
          <ul key={name} className={styles.transactionList}>
            {blockchain.transactions.map((txn, i) => (
              <li key={i} className={styles.transactionItem}>
                <a
                  aria-label="link-on-chain-explorer"
                  href={`/transactions/${name}/${txn.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.transactionLink}
                >
                  <RedirectIcon className={styles.redirectIcon} />

                  <div className={styles.blockchainWrapper}>
                    <Icon className={styles.blockchainIcon} />
                    <span className={styles.blockchainName}>{name}</span>
                  </div>

                  <div className={styles.transactionDetails}>
                    <p className={styles.transactionMessage}>
                      {txn.hash ? 'Sample transaction hash' : txn.message}
                    </p>
                    <span className={styles.transactionHash}>
                      {txn.hash ? parseAddress(txn.hash) : '-'}
                    </span>
                  </div>

                  <span className={styles.transactionStatus}>
                    <span className={styles.t}>Status:</span>
                    <StatusBadge type={txn.type} small />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
};

export default function Home() {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [addressHash, setAddressHash] = useState('');

  const router = useRouter();

  const handleClick = () => {
    // const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressHash);

    if (addressHash && selectedChain) {
      // Navigates to /selectedChain/addressHash
      router.push(`/${selectedChain}/address/${addressHash}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setAddressHash(value);
  };

  return (
    <section className={styles.heroContainer}>
      <div className={styles.bgGradient}></div>

      <header className={styles.heroHeader}>BlockSight Explorer</header>

      <div className={styles.walletAddressLabel}>
        <input
          name="search"
          type="search"
          aria-label="search"
          placeholder={'Enter wallet address...'}
          onClick={handleClick}
          className={styles.walletAddressInput}
          onChange={handleChange}
        />

        <Dropdown
          label="Select Blockchain"
          options={dropdownOptions}
          value={selectedChain}
          onSelect={({ value }) => setSelectedChain(value)}
          classNames={{ container: `sm:max-w-[220px] lg:max-w-[220px]` }}
        />
      </div>

      <button
        type="button"
        aria-label="Get Transactions for the entered address"
        onClick={handleClick}
        disabled={!addressHash}
        className={styles.getTxnButton}
      >
        <SearchIcon className={styles.searchIcon} aria-hidden="true" />
        Get Transactions
      </button>

      <QuickLinks />
    </section>
  );
}
