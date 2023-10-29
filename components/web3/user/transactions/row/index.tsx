import React, { Fragment, useMemo } from 'react';

import cx from 'classnames';

import { RedirectIcon } from '@/components/shared/icons';
import Badge from '@/components/shared/badge';

import { formatTimestamp } from '@/utils/formatTimestamp';
import { parseAddress } from '@/utils/parseAddress';

import { UserTransaction } from '@/types/transaction';
import { Blockchain } from '@/types/blockchain';
import { Styles } from '@/types/styles';

const typeColor: any = {
  in: 'text-[#00a186] bg-green-900/20 outline-[#00a186]/30',
  out: 'text-[#d29922] bg-yellow-900/20 outline-[#d29922]/30',
};

const styles: Styles = {
  tableRow: `flex w-full h-[80px] shrink-0 hover:bg-secondary/[3%] smooth-transition`,
  typeWrapper: `flex items-center justify-center py-4 px-6 gap-2 cursor-default h-full`,
  typeLoader: `h-[24px] w-10/12 bg-secondary/20 animate-pulse rounded-xl`,
  typeText: `text-[0.725rem] px-2 py-1 rounded-md uppercase font-display outline outline-[1px]`,
  priceWrapper: `relative flex items-center justify-center h-full max-w-[180px]`,
  priceLoader: `w-11/12 h-[23px] bg-secondary/20 animate-pulse rounded-xl`,
  priceBlock: `flex items-center gap-1 py-4 cursor-default overflow-hidden`,
  priceValue: `font-mono text-secondary/60 tracking-wide font-medium truncate text-ellipsis`,
  chainIcon: `h-[16px] w-[16px]`,
  addressWrapper: `flex items-center justify-center h-full`,
  addressLoader: `w-9/12 h-[18px] bg-secondary/20 animate-pulse rounded-xl`,
  addressRedirect: `group flex items-center justify-center gap-2 py-4 font-mono text-sm hover:text-secondary/80 text-secondary/60 cursor-pointer select-none smooth-transition`,
  redirectIcon: `h-[14px] w-[14px] text-transparent group-hover:text-inherit smooth-transition`,
  dateWrapper: `relative flex items-center h-full w-[180px]`,
  dateLoader: `w-11/12 h-[18px] bg-secondary/20 animate-pulse rounded-xl`,
  formattedTime: `flex py-4 tracking-wide text-[0.97rem] italic text-secondary/60`,
  nullAddress: `flex items-center justify-center h-full text-secondary/40`,
};

interface TxnRowProps {
  txn: UserTransaction | any;
  addressHash: string;
  blockchain: Blockchain;
}

interface AddressProps {
  address: string;
  isLoading: boolean;
  blockchain: Blockchain;
  addressType?: 'tx' | 'address';
}

const AddressHash: React.FC<AddressProps> = ({
  blockchain,
  address,
  isLoading,
  addressType = 'address',
}) => {
  const href =
    addressType === 'tx'
      ? `/transactions/${blockchain.name}/${address}`
      : `/${blockchain.name}/address/${address}`;

  return (
    <div className={styles.addressWrapper}>
      {isLoading ? (
        <div className={styles.addressLoader}></div>
      ) : !address ? (
        <span className={styles.nullAddress}>-</span>
      ) : (
        <a
          aria-label="link-on-chain-explorer"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.addressRedirect}
        >
          {parseAddress(address)}
          <RedirectIcon className={styles.redirectIcon} />
        </a>
      )}
    </div>
  );
};

const TxnRow: React.ForwardRefRenderFunction<
  HTMLTableRowElement,
  TxnRowProps
> = ({ txn, addressHash, blockchain }, ref) => {
  const isLoading = !txn.direction || !addressHash || !blockchain;

  const Body = useMemo(() => {
    return (
      <Fragment>
        {/* Transaction Type */}
        <td className="w-1/6 overflow-hidden">
          <div className={styles.typeWrapper}>
            {/* {isLoading ? (
              <div className={styles.typeLoader}></div>
            ) : (
              <span className={cx(styles.typeText, typeColor[txn.direction])}>
                {txn.direction}
              </span>
            )} */}
            <Badge type={txn.direction} isLoading={isLoading} />
          </div>
        </td>

        {/* Transaction Hash */}
        <td className="w-1/3 overflow-hidden">
          <AddressHash
            blockchain={blockchain}
            address={txn.txnHash}
            addressType="tx"
            isLoading={isLoading}
          />
        </td>

        {/* Amount */}
        <td className="w-3/12">
          <div className={styles.priceWrapper}>
            {isLoading ? (
              <div className={styles.priceLoader}></div>
            ) : (
              <div className={styles.priceBlock}>
                <blockchain.Icon className={styles.chainIcon} />
                <span className={styles.priceValue}>{txn.amountInEth}</span>
              </div>
            )}
          </div>
        </td>

        {/* From */}
        <td className="w-1/3 overflow-hidden">
          <AddressHash
            blockchain={blockchain}
            address={txn.from}
            isLoading={isLoading}
          />
        </td>

        {/* To */}
        <td className="w-1/3 overflow-hidden">
          <AddressHash
            blockchain={blockchain}
            address={txn.to}
            isLoading={isLoading}
          />
        </td>

        {/* Timestamp */}
        <td className="w-1/3">
          <div className={styles.dateWrapper}>
            {isLoading ? (
              <div className={styles.dateLoader}></div>
            ) : (
              <div className={styles.formattedTime}>
                {formatTimestamp(txn.timestamp)}
              </div>
            )}
          </div>
        </td>
      </Fragment>
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  return ref ? (
    <tr ref={ref} className={styles.tableRow}>
      {Body}
    </tr>
  ) : (
    <tr className={styles.tableRow}>{Body}</tr>
  );
};

export default React.forwardRef(TxnRow);
