'use client';

import { RedirectIcon } from '@/components/shared/icons';

import { Blockchain } from '@/types/blockchain';
import { Styles } from '@/types/styles';

interface WalletDetails {
  loading: boolean;
  data: {
    balance: number | null;
    txnCount: number;
  } | null;
}

interface WalletCardProps {
  walletDetails: WalletDetails;
  addressHash: string;
  blockchain: Blockchain;
}

const styles: Styles = {
  walletCard: `overflow-hidden relative flex flex-col h-[180px] w-full max-w-[350px] shrink-0 rounded-xl bg-secondary/[3%] border-t-[1.5px] border-secondary/10`,
  walletContainer: `items-start pl-10 pt-12`,
  balanceSkeleton: `flex flex-col gap-1`,
  balanceHeaderSkeleton: `h-5 w-24 bg-secondary/20 animate-pulse rounded-3xl`,
  balanceAmountSkeleton: `h-6 w-24 bg-secondary/20 animate-pulse rounded-3xl`,
  balanceHeader: `text-secondary/40`,
  balanceWrapper: `flex flex-row gap-2 items-center text-secondary/80`,
  balanceText: `text-xl font-semibold tracking-wider`,
  balanceCurrency: `text-xl uppercase`,
  chainIconContainer: `absolute top-4 right-3`,
  chainIconSkeleton: `h-10 w-10 rounded-full shadow-xl bg-secondary/20 animate-pulse`,
  chainIconWrapper: `h-10 w-10 flex items-center justify-center bg-secondary/10 rounded-full shadow-xl`,
  chainIcon: `h-6 w-6`,
  bgCircleBottomRight: `blur-2xl absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 rounded-full p-20 bg-white bg-opacity-5 pointer-events-none`,
  bgCircleTopLeft: `blur-3xl absolute top-0 left-0 transform -translate-x-1/3 -translate-y-1/4 rounded-full p-20 bg-white bg-opacity-10 pointer-events-none`,
  addressWrapper: `absolute inset-x-0 bottom-5 h-8 flex justify-center items-center bg-secondary/[4%]`,
  loadingAddress: `h-[11px] w-11/12 bg-secondary/20 rounded-full shadow-xl animate-pulse`,
  addressGroup: `group flex items-center justify-center gap-1.5 cursor-pointer`,
  addressText: `truncate text-ellipsis font-mono font-medium text-xs group-hover:text-secondary/60 text-secondary/40 smooth-transition`,
  copyIcon: `h-3 w-3 shrink-0 text-secondary/0 group-hover:text-secondary/60 smooth-transition`,
};

const WalletCard: React.FC<WalletCardProps> = ({
  walletDetails,
  addressHash,
  blockchain,
}) => {
  const { explorer_url, currency, Icon } = blockchain;
  const { loading, data } = walletDetails;

  return (
    <div className={styles.walletCard}>
      <div className={styles.walletContainer}>
        {loading ? (
          <div className={styles.balanceSkeleton}>
            <div className={styles.balanceHeaderSkeleton}></div>
            <div className={styles.balanceAmountSkeleton}></div>
          </div>
        ) : (
          <div className="flex flex-col">
            <p className={styles.balanceHeader}>Your Balance</p>

            <div className={styles.balanceWrapper}>
              <span className={styles.balanceText}>
                {data && data.balance !== null
                  ? parseFloat(data.balance.toString()).toFixed(3)
                  : '0.000'}
              </span>

              <span className={styles.balanceCurrency}>{currency}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.chainIconContainer}>
        {loading ? (
          <div className={styles.chainIconSkeleton}></div>
        ) : (
          <div className={styles.chainIconWrapper}>
            <Icon className={styles.chainIcon} />
          </div>
        )}
      </div>

      <div className={styles.addressWrapper}>
        {loading ? (
          <div className={styles.loadingAddress}></div>
        ) : (
          <a
            aria-label="link-on-chain-explorer"
            href={`${explorer_url}/address/${addressHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.addressGroup}
          >
            <span className={styles.addressText}>{addressHash}</span>
            <RedirectIcon className={styles.copyIcon} aria-hidden="true" />
          </a>
        )}
      </div>

      <div className={styles.bgCircleBottomRight}></div>
      <div className={styles.bgCircleTopLeft}></div>
    </div>
  );
};

export default WalletCard;
