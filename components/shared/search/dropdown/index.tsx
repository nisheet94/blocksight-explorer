import React, { useRef, useEffect, useState } from 'react';
import cx from 'classnames';

import {
  SearchState,
  MIN_SEARCH_VALUE,
  SearchActions,
  SearchAction,
} from '@/components/shared/search';

import { DropdownAnimation } from '@/utils/constants/animation';

import { MagnifyIcon } from '@/components/shared/icons';

import { Styles } from '@/types/styles';
import { ApiResponse } from '@/types/api';

const styles: Styles = {
  dropdown: `absolute z-20 w-full mt-2 flex flex-col h-min border-[.5px] bg-dropdown border-secondary/[10%] rounded-xl overflow-hidden`,
  dropdownWrapper: `max-h-[240px] visible-scrollbar overflow-y-scroll`,
  dropdownList: `animate-fade-in-quick grid grid-cols-1`,
  noResultsWrapper: `h-[80px] flex items-center justify-center gap-2 px-4 text-secondary/60 overflow-hidden`,
  noResultsIcon: `h-[20px] w-[20px] shrink-0`,
  noResults: `animate-fade-in-quick tracking-wider italic truncate text-ellipsis select-none`,
  disabledWrapper: `h-[80px] w-full flex items-center justify-center`,
  disabledLoader: `animate-fade-in-quick loader h-6 w-6`,
};

interface SearchDropdownProps<T> {
  onSearch: (query: string) => Promise<ApiResponse<T | T[]>>;
  searchState: SearchState;
  searchDispatch: React.Dispatch<SearchAction>;
  SearchItem: React.FC<{ item: T }>;
}

function SearchDropdown<T>({
  onSearch,
  searchState,
  searchDispatch,
  SearchItem,
}: SearchDropdownProps<T>) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { search, showDropdown, searchAnimation, isLoading } = searchState;

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAnimationEnd = () => {
    if (searchAnimation === DropdownAnimation.Exit) {
      searchDispatch({ type: SearchActions.ANIMATION_ENDED });
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (search.trim().length < MIN_SEARCH_VALUE) return;

    let isSubscribed = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await onSearch(search.trim());

        if (response.success) {
          if (isSubscribed) {
            timerRef.current = setTimeout(() => {
              const resultsArray = Array.isArray(response.data)
                ? response.data
                : response.data !== undefined
                ? [response.data]
                : [];

              setSearchResults(resultsArray);
              searchDispatch({ type: SearchActions.IS_NOT_LOADING });
            }, 350);
          }
        } else {
          // Handle the error response if needed.
          // Setup custom error to show on search bar i.e. set new State
          console.error('Error from the server:', response.error?.message);
          searchDispatch({ type: SearchActions.IS_NOT_LOADING });
        }
      } catch (error) {
        console.error('Error fetching search data', error);
        searchDispatch({ type: SearchActions.IS_NOT_LOADING });
      }
    };
    fetchData();

    return () => {
      isSubscribed = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return showDropdown ? (
    <div
      className={cx(styles.dropdown, searchAnimation)}
      onAnimationEnd={handleAnimationEnd}
    >
      {isLoading ? (
        <div className={styles.disabledWrapper}>
          <div className={styles.disabledLoader}></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className={styles.dropdownWrapper}>
          <ul className={styles.dropdownList}>
            {searchResults.map((item, i) => (
              <li key={i}>
                <SearchItem item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.noResultsWrapper}>
          <MagnifyIcon className={styles.noResultsIcon} />
          <span className={styles.noResults}>
            No Results found for {`"${search}"`}
          </span>
        </div>
      )}
    </div>
  ) : null;
}

export default SearchDropdown;
