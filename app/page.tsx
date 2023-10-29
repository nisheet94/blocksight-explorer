'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { blockchains } from '@/utils/constants/blockchains';

import { SearchIcon } from '@/components/shared/icons';

import { Styles } from '@/types/styles';

const styles: Styles = {
  heroContainer: `flex flex-col mt-[180px] lg:mt-[200px] xl:mt-[220px] max-w-[700px] w-full px-4 overflow-hidden mx-auto`,
  heroHeader: `mb-6 bg-gradient-to-br from-white to-stone-500 bg-clip-text font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm [text-wrap:balance] sm:text-5xl sm:leading-[5rem]`,
  getTxnButton: `flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary/60 to-gray-300 text-primary hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed smooth-transition rounded-xl text-xl font-medium cursor-pointer drop-shadow-lg`,
  walletAddressLabel: `grid grid-cols-1 items-center justify-center gap-6 w-full`,
  walletAddressInput: `flex grow items-center justify-center px-4 py-3 w-full border outline-none border-neutral-800 rounded-lg 2md:rounded-xl bg-zinc-700/30 smooth-transition overflow-hidden text-secondary/80`,
  blockchainList: `flex items-center mx-auto gap-4`,
  blockchainLabel: `flex items-center justify-center px-4 sm:px-6 py-3 gap-2 w-full bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border border-b border-gray-300 bg-gray-200 sm:text-lg capitalize cursor-pointer hover:dark:bg-zinc-700/30 smooth-transition`,
  blockchainIcon: `h-3.5 w-3.5 sm:h-5 sm:w-5`,
  searchIcon: `h-6 w-6`,
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
      <header className={styles.heroHeader}>Frontend Assessment.</header>

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

        <ul className={styles.blockchainList}>
          {Object.entries(blockchains).map(([key, blockchain]) => (
            <li key={key} className="w-full">
              <label className={styles.blockchainLabel}>
                <input
                  type="radio"
                  id={`radio-${blockchain.name}`}
                  name="blockchainSelection"
                  value={blockchain.name}
                  checked={selectedChain === blockchain.name}
                  onChange={() => setSelectedChain(blockchain.name)}
                  className={styles.blockchainIcon}
                />
                <blockchain.Icon className={styles.blockchainIcon} />
                {blockchain.name}
              </label>
            </li>
          ))}
        </ul>

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
      </div>
    </section>
  );
}
