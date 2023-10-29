import { GithubIcon } from '../shared/icons';

import { Styles } from '@/types/styles';

const styles: Styles = {
  footerContainer: `mt-8 mx-auto max-width pb-[30px] sm:pb-[50px]`,
  footerDivider: `mx-4 h-[2px] bg-secondary/5 mb-[30px] sm:mb-[50px]`,
  socialLinkItem: `ml-[40px] group p-[10px] sm:p-3 h-[48px] w-[48px] sm:h-[64px] sm:w-[64px] gap-1 grayscale rounded-xl sm:rounded-[1.2rem] 2xsm:rounded-3xl hover:rounded-xl bg-secondary/10 text-secondary/80 hover:bg-secondary/5 hover:shadow-md transition-all duration-300 ease-linear`,
};

const github = 'https://github.com/nisheet94/web3-transactions-app';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerDivider}></div>

      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit the github page`}
      >
        <div className={styles.socialLinkItem}>
          <GithubIcon />
        </div>
      </a>
    </footer>
  );
}
