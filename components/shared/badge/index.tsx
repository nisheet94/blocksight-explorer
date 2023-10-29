import React from 'react';
import cx from 'classnames';

const typeColor: any = {
  in: 'text-[#00a186] bg-green-900/20 outline-[#00a186]/30',
  out: 'text-[#d29922] bg-yellow-900/20 outline-[#d29922]/30',
};

const styles: any = {
  wrapper: `flex items-center justify-center gap-2 h-full pointer-events-none`,
  loader: `h-[24px] w-10/12 bg-secondary/20 animate-pulse rounded-xl`,
  text: `text-[0.725rem] flex items-center justify-center  rounded-md uppercase font-display outline outline-[1px]`,
};

interface BadgeProps {
  type: 'in' | 'out' | string; // If you anticipate other types, you can use the string type, else keep 'in' | 'out'
  isLoading?: boolean;
  full?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ type, isLoading, full = false }) => {
  if (isLoading) {
    return <div className={styles.loader}></div>;
  }
  return (
    <div className={styles.wrapper}>
      <span
        className={cx(styles.text, typeColor[type], {
          'h-8 w-8 sm:h-10 sm:w-10': full,
          'px-2 py-1': !full,
        })}
      >
        {type}
      </span>
    </div>
  );
};

export default Badge;
