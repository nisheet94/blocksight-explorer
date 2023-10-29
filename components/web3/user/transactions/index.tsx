'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import TxnRow from '@/components/web3/user/transactions/row';

import useInfiniteTransactions from '@/hooks/useInfiniteTransactions';

import { ArrowIcon, TransactionIcon } from '@/components/shared/icons';

import { UserTransaction } from '@/types/transaction';
import { Blockchain } from '@/types/blockchain';
import { Styles } from '@/types/styles';

const styles: Styles = {
  tableContainer: `relative overflow-x-auto`,
  table: `mt-8 lg:mt-10 overflow-hidden table table-fixed min-w-[900px] w-full rounded-xl`,
  thWrapper: `flex w-full bg-gradient-to-br from-secondary/[6%] to-secondary/[4%]`,
  th: `group font-semibold text-secondary/40`,
  tbody: `flex flex-col items-center justify-between`,
  sortButton: `flex items-center gap-2 w-full py-4 group-hover:text-secondary/60 smooth-transition`,
  doubleArrowWrapper: `flex flex-col`,
  doubleArrow: `h-3.5 w-3.5 smooth-transition`,
  emptyWrapper: `pt-20 pb-40 flex items-center justify-center gap-4`,
  txnIcon: `h-[30px] w-[30px] sm:h-[50px] sm:w-[50px] text-secondary/40 shrink-0`,
  txnText: `text-sm sm:text-base italic font-[400] text-secondary/40`,
};

type Direction = 'asc' | 'desc' | 'neutral';
type SortState = { key: string; order: 'asc' | 'desc' };

type UserTransactionsProps = {
  addressHash: string;
  blockchain: Blockchain;
  endBlock: number | null;
};

interface DoubleArrowProps {
  direction?: Direction;
}

interface TransactionsProps {
  results: UserTransaction[];
  lastEventRef: React.RefCallback<Element>;
  addressHash: string;
  blockchain: Blockchain;
}

// amount of transactions to be load at a time
const AMOUNT_OF_TRANSACTIONS = 12;

const EMPTY_ARRAY = Array.from(
  { length: AMOUNT_OF_TRANSACTIONS },
  (_, index) => index
);

const DoubleArrow: React.FC<DoubleArrowProps> = ({ direction = 'neutral' }) => {
  const defaultColor = 'text-secondary/[25%]';
  const activeColor = 'text-secondary/60';

  const getArrowColor = (dir: Direction, position: 'top' | 'bottom') => {
    if (dir === 'asc' && position === 'top') {
      return activeColor;
    } else if (dir === 'desc' && position === 'bottom') {
      return activeColor;
    }
    return defaultColor;
  };

  return (
    <div className={styles.doubleArrowWrapper}>
      <ArrowIcon
        className={cx(
          styles.doubleArrow,
          getArrowColor(direction, 'top'),
          '-rotate-90'
        )}
      />
      <ArrowIcon
        className={cx(
          styles.doubleArrow,
          getArrowColor(direction, 'bottom'),
          'rotate-90'
        )}
      />
    </div>
  );
};

const Transactions = ({
  results,
  lastEventRef,
  addressHash,
  blockchain,
}: TransactionsProps) => {
  return results.map((txn, i) => {
    if (results.length - AMOUNT_OF_TRANSACTIONS + 1 === i) {
      return (
        <TxnRow
          ref={lastEventRef}
          key={i}
          txn={txn}
          addressHash={addressHash}
          blockchain={blockchain}
        />
      );
    }
    return (
      <TxnRow
        key={i}
        txn={txn}
        addressHash={addressHash}
        blockchain={blockchain}
      />
    );
  });
};

export default function UserTransactions({
  addressHash,
  blockchain,
  endBlock,
}: UserTransactionsProps) {
  const [sortState, setSortState] = useState<SortState>({
    key: 'timestamp',
    order: 'desc',
  });

  const handleSortChange = (key: string) => {
    let newOrder: 'asc' | 'desc' = 'desc';
    if (sortState && sortState.key === key && sortState.order === 'desc') {
      newOrder = 'asc';
    }
    setSortState({ key, order: newOrder });
  };

  const getArrowDirection = (key: string) => {
    if (!sortState || sortState.key !== key) return 'neutral';
    return sortState.order;
  };

  const { results, isLoading, hasMoreTransactions, fetchMore } =
    useInfiniteTransactions({
      addressHash: addressHash,
      amount: AMOUNT_OF_TRANSACTIONS,
      chain: blockchain.name,
      sortState: sortState,
      endBlock: endBlock,
    });

  const intersectionObserver = useRef<IntersectionObserver>(null);

  const LastEventRef = (intersectionObserver: any) =>
    useCallback(
      (event: Element) => {
        if (isLoading) return;

        if (intersectionObserver.current)
          intersectionObserver.current.disconnect();

        intersectionObserver.current = new IntersectionObserver((events) => {
          if (events[0].isIntersecting && hasMoreTransactions) {
            // console.log('Getting near the last transaction');
            fetchMore();
          }
        });

        if (event) intersectionObserver.current.observe(event);
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isLoading, hasMoreTransactions]
    );

  useEffect(() => {
    const currentObserver = intersectionObserver.current;
    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead key="thead" className="flex">
          <tr className={styles.thWrapper}>
            <th className={cx(styles.th, 'text-center w-1/6 py-4')}>Type</th>
            <th className={cx(styles.th, 'text-center w-1/3 py-4')}>
              Txn Hash
            </th>
            <th className={cx(styles.th, 'text-center w-3/12')}>
              <button
                role="button"
                tabIndex={0}
                aria-label={`Sort Price column in ${getArrowDirection(
                  'Amount'
                )} order`}
                className={cx(styles.sortButton, 'justify-center')}
                onClick={() => handleSortChange('amount')}
              >
                Price
                <DoubleArrow direction={getArrowDirection('amount')} />
              </button>
            </th>
            <th className={cx(styles.th, 'text-center w-1/3 py-4')}>From</th>
            <th className={cx(styles.th, 'text-center w-1/3 py-4')}>To</th>
            <th className={cx(styles.th, 'text-left w-1/3 px-4')}>
              <button
                role="button"
                tabIndex={0}
                aria-label={`Sort Date column in ${getArrowDirection(
                  'timestamp'
                )} order`}
                className={styles.sortButton}
                onClick={() => handleSortChange('timestamp')}
              >
                Date
                <DoubleArrow direction={getArrowDirection('timestamp')} />
              </button>
            </th>
          </tr>
        </thead>

        <tbody key="tbody" className={styles.tbody}>
          {!isLoading && results?.length === 0 && (
            <tr className="h-full">
              <td className={styles.emptyWrapper}>
                <TransactionIcon className={styles.txnIcon} />
                <span className={styles.txnText}>No transactions found.</span>
              </td>
            </tr>
          )}

          <Transactions
            results={results}
            lastEventRef={LastEventRef(intersectionObserver)}
            addressHash={addressHash}
            blockchain={blockchain}
          />

          {isLoading &&
            EMPTY_ARRAY.map((txn, i) => (
              <TxnRow
                key={i}
                txn={txn}
                blockchain={blockchain}
                addressHash={addressHash}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
