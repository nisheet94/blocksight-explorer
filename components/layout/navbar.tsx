import React, { Fragment } from 'react';

import { FullLogo } from '@/components/shared/icons';

import { Styles } from 'types/styles';

const styles: Styles = {
  navBackground: `fixed top-0 z-30 h-16 md:h-[100px] w-full bg-primary/50 md:bg-transparent md:bg-gradient-to-b md:from-primary md:to-transparent backdrop-blur md:backdrop-blur-0 pointer-events-none`,
  navigationContainer: `fixed z-40 top-0 h-16 md:h-[100px] w-full flex justify-between items-center pointer-events-none`,
  homeLink: `px-[14px] md:px-[30px] xl:px-[40px] text-secondary hover:opacity-60 pointer-events-auto smooth-transition`,
  logoIcon: `z-10 h-[46px] md:h-[64px]`,
};

const Navbar: React.FC = () => {
  return (
    <Fragment>
      <div className={styles.navBackground}></div>
      <nav className={styles.navigationContainer}>
        <a
          href="/"
          className={styles.homeLink}
          aria-label="Home"
          title={`Home`}
        >
          <FullLogo className={styles.logoIcon} aria-hidden="true" />
        </a>
      </nav>
    </Fragment>
  );
};

export default Navbar;
