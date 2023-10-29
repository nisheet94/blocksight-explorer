import React from 'react';
import cx from 'classnames';

import { Status } from '@/utils/constants/status';

const typeColor: any = {
  success: 'text-[#00a186] bg-green-900/20',
  failed: 'text-[#F85149] bg-red-900/20',
  pending: 'text-[#d29922] bg-yellow-900/20',
};

const styles: any = {
  wrapper: `flex items-center justify-center gap-2 h-full pointer-events-none`,
  loader: `h-[24px] w-[100px] bg-secondary/20 animate-pulse rounded-xl`,
  text: `w-min flex items-center justify-center rounded-lg font-display px-3 py-0.5 px-2 py-1`,
};

interface BadgeProps {
  type: Status;
  isLoading?: boolean;
  small?: boolean;
}

const StatusBadge: React.FC<BadgeProps> = ({
  type,
  isLoading,
  small = false,
}) => {
  if (isLoading) {
    return <div className={styles.loader}></div>;
  }
  return (
    <div className={styles.wrapper}>
      <span
        className={cx(styles.text, typeColor[type], {
          'sm:text-lg capitalize': !small,
          'text-[0.725rem] uppercase': small,
        })}
      >
        {type}
      </span>
    </div>
  );
};

export default StatusBadge;
