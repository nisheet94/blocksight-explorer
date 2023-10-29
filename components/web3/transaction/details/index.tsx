import cx from 'classnames';

import StatusBadge from '@/components/shared/badge/status';

import { parseAddress } from '@/utils/parseAddress';
import { formatTimestamp } from '@/utils/formatTimestamp';

import { RedirectIcon } from '@/components/shared/icons';

import { Blockchain } from '@/types/blockchain';
import { Styles } from '@/types/styles';
import { TransactionType } from '@/types/transaction';

const styles: Styles = {
  transaction: `flex flex-col xl:flex-row gap-4 w-full`,
  bgGradient: `absolute sm:left-0 left-12 top-[60px] sm:top-[100px] flex items-center justify-center before:h-[300px] before:sm:w-[480px] before:w-[140px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:sm:w-[240px] after:w-[140px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] pointer-events-none`,
  transactionCard: `relative w-full max-w-[400px] px-4 sm:px-8 py-6 h-min rounded-xl bg-secondary/[3%] border-t-[1.5px] border-secondary/10`,
  cardHeader: `flex items-center gap-2 sm:gap-3`,
  headerIcon: `h-4 w-4 sm:h-6 sm:w-6`,
  headerTitle: `capitalize text-secondary/40 font-display text-xl sm:text-2xl font-medium tracking-[-0.02em] drop-shadow-sm`,
  cardValue: `mt-5 flex flex-col gap-1`,
  valueLabel: `text-sm sm:text-base text-secondary/30`,
  valueContent: `flex whitespace-nowrap gap-2 text-xl sm:text-2xl truncate`,
  valueAmount: `overflow-hidden text-ellipsis font-mono text-secondary/60`,
  valueCurrency: `font-display font-medium text-secondary/80`,
  cardFooter: `mt-7 flex justify-between items-baseline`,
  footerUsd: `pl-2 font-mono text-sm sm:text-base text-secondary/40`,
  transactionDetails: `flex flex-col grow gap-8 sm:px-4 py-8`,
  transactionHash: `flex flex-col gap-4`,
  status: `capitalize w-min sm:text-lg px-3 py-0.5 font-display rounded-lg`,
  sectionDivider: `h-[1.5px] bg-gradient-to-r from-primary via-secondary/50 to-secondary/10`,
  advancedInfoContainer: `pt-6 md:pt-8`,
  sectionTitle: `text-xl sm:text-2xl font-display text-secondary/80`,
  advancedInfo: `mt-8 grid grid-cols-1 gap-6`,
  infoBlock: `flex flex-col sm:flex-row justify-between gap-1`,
  infoLabel: `tracking-wide text-secondary/80 font-medium`,
  timeString: `font-mono tracking-wide text-secondary/80`,
  priceBlock: `text-sm sm:text-base text-ellipsis text-secondary/40`,
  pricePrimary: `font-mono text-secondary/80`,
  priceSecondary: `font-mono`,
  currencyPrimary: `font-medium font-display text-secondary/80`,
  currencySecondary: `font-medium font-display`,
  redirectWrapper: `overflow-hidden group flex items-center gap-2 pr-4 sm:pr-0 text-secondary/40`,
  addressHash: `truncate text-ellipsis font-mono text-sm sm:text-base tracking-wide group-hover:text-secondary/80 text-secondary/60 smooth-transition`,
  redirectIcon: `h-3 w-3 shrink-0 group-hover:text-secondary/60 smooth-transition`,
};

type ExplorerLinkProps = {
  blockchain: Blockchain;
  addressHash: string;
  type?: 'tx' | 'address';
  shortForm?: boolean;
};

const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  blockchain,
  addressHash,
  type = 'tx',
  shortForm = false,
}) => {
  if (!addressHash) {
    return <span className={styles.addressHash}>-</span>;
  }

  const displayAddress = shortForm ? parseAddress(addressHash) : addressHash;

  return (
    <a
      aria-label="link-to-chain-explorer-txn"
      href={`${blockchain.explorer_url}/${type}/${addressHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.redirectWrapper}
    >
      <span className={styles.addressHash}>{displayAddress}</span>
      <RedirectIcon className={styles.redirectIcon} />
    </a>
  );
};

type TransactionDetailsProps = {
  transaction: TransactionType;
  blockchain: Blockchain;
};

const statusColors = {
  pending: 'text-[#d29922] bg-yellow-900/20',
  success: 'text-[#00a186] bg-green-900/20',
  failed: 'text-[#F85149] bg-red-900/20',
};

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  blockchain,
}) => {
  const {
    txnHash,
    from,
    to,
    amountInEth,
    amountInUsd,
    gasPriceInGwei,
    gasFeeInEth,
    status,
    blockNumber,
    timestamp,
    txnFeeInEth,
    txnFeeInUSD,
  } = transaction;

  const { name, currency, Icon } = blockchain;

  const timeString = formatTimestamp(timestamp);

  return (
    <div className={styles.transaction}>
      <div className={styles.bgGradient}></div>

      <div className={styles.transactionCard}>
        <div className={styles.cardHeader}>
          <Icon className={styles.headerIcon} />
          <p className={styles.headerTitle}>{name}</p>
        </div>

        <div className={styles.cardValue}>
          <span className={styles.valueLabel}>Value</span>

          <div className={styles.valueContent}>
            <span className={styles.valueAmount}>{amountInEth}</span>
            <span className={styles.valueCurrency}>{currency}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          {/* <div className={cx(styles.status, statusColors[status])}>
            {status}
          </div> */}
          <StatusBadge type={status} />
          <span className={styles.footerUsd}>(${amountInUsd})</span>
        </div>
      </div>

      <div className={styles.transactionDetails}>
        <div className={styles.transactionHash}>
          <span className={styles.sectionTitle}>Transaction Hash</span>

          <ExplorerLink
            blockchain={blockchain}
            addressHash={txnHash}
            type="tx"
          />
        </div>

        <div className={styles.sectionDivider}></div>

        <div className={styles.advancedInfoContainer}>
          <span className={styles.sectionTitle}>Advanced Information</span>

          <div className={styles.advancedInfo}>
            {/* Timestamp */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Timestamp</span>

              <span className={styles.timeString}>{timeString}</span>
            </div>

            {/* Block */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Block</span>

              <span className={styles.timeString}>{blockNumber || '-'}</span>
            </div>

            {/* From */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>From</span>

              <ExplorerLink
                blockchain={blockchain}
                addressHash={from}
                type="address"
                shortForm
              />
            </div>

            {/* To */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>To</span>

              <ExplorerLink
                blockchain={blockchain}
                addressHash={to}
                type="address"
                shortForm
              />
            </div>

            {/* Transaction Fee */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>
                {status === 'pending' ? 'Max Txn Cost/Fee' : 'Transaction Fee'}
              </span>

              <span className={styles.priceBlock}>
                <span className={styles.pricePrimary}>{txnFeeInEth}</span>{' '}
                <span className={styles.currencyPrimary}> {currency} </span> (
                <span className={styles.priceSecondary}>${txnFeeInUSD}</span>){' '}
              </span>
            </div>

            {/* Gas Price */}
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Gas Price</span>

              <span className={styles.priceBlock}>
                <span className={styles.pricePrimary}>{gasPriceInGwei}</span>{' '}
                <span className={styles.currencyPrimary}> Gwei </span> (
                <span className={styles.priceSecondary}>{gasFeeInEth}</span>{' '}
                <span className={styles.currencySecondary}>{currency}</span>){' '}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
