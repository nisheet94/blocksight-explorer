import { Metadata } from 'next';
import * as React from 'react';
import Link from 'next/link';

import { Error404, ArrowIcon } from '@/components/shared/icons';

import { Styles } from '@/types/styles';

const styles: Styles = {
  sectionContainer: `flex flex-col lg:flex-row-reverse gap-8 items-center lg:items-start justify-center py-[10vh] px-4 sm:px-6 lg:px-12 mx-auto`,
  errorIcon: `text-secondary/80 w-full max-w-[412px] xl:max-w-[512px] h-min px-4`,
  textContainer: `max-w-[30rem] sm:max-w-[45rem] lg:max-w-[35rem] xl:max-w-[40rem] flex flex-col items-center lg:items-start pt-10`,
  mainErrorText: `text-center lg:text-start font-display text-[1.5rem] leading-[2rem] sm:text-[2rem] sm:leading-[2rem] xl:text-[2.5rem] xl:leading-[2.5rem] text-secondary/80`,
  secondaryErrorText: `text-center lg:text-start mt-8 text-base leading-[1.875rem] tracking-[.02em] sm:text-[1.25rem] sm:leading-[1.8] text-secondary/50`,
  homeButton: `mt-5 group inline-flex justify-center items-center gap-3 py-3 px-8 text-[1.175rem] sm:text-[1.25rem] font-semibold text-secondary/80 hover:opacity-60 smooth-transition`,
  arrowIcon: `shrink-0 h-4 w-4 rotate-180 transform group-hover:-translate-x-1 smooth-transition`,
};

export default function NotFound() {
  return (
    <section className={styles.sectionContainer}>
      <Error404 className={styles.errorIcon} />

      <div className={styles.textContainer}>
        <h1 className={styles.mainErrorText}>Oops, something went wrong...</h1>

        <p className={styles.secondaryErrorText}>
          The page you are looking for doesn&apos;t seem to exist or has been
          moved to a new location.
        </p>

        <Link href="/" className={styles.homeButton}>
          <ArrowIcon className={styles.arrowIcon} />
          Go back Home
        </Link>
      </div>
    </section>
  );
}
