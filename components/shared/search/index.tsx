import React, { useReducer, useRef, useEffect, ChangeEvent } from 'react';
import cx from 'classnames';

import SearchDropdown from './dropdown';

import { DropdownAnimation } from '@/utils/constants/animation';

import { MagnifyIcon } from '@/components/shared/icons';

import { Styles } from '@/types/styles';
import { ApiResponse } from '@/types/api';

// Minimum search characters to show the search dropdown
export const MIN_SEARCH_VALUE = 3;

// Max characters in the search bar
export const MAX_SEARCH_LENGTH = 128;

const styles: Styles = {
  container: `relative w-full`,
  searchContainer: `overflow-hidden w-full flex items-center justify-center dark:bg-secondary/[8%] border-t-[1.5px] dark:border-secondary/[5%] focus-within:ring-4 dark:focus-within:ring-secondary/[4%] rounded-lg 2md:rounded-xl smooth-transition`,
  searchInput: `z-0 w-0 flex-grow px-4 lg:px-6 pr-2 h-[56px] sm:h-[66px] text-secondary/60 font-display tracking-wide outline-none bg-transparent placeholder:tracking-wide disabled:text-gray-400 disabled:cursor-not-allowed placeholder-secondary/40 placeholder:tracking-wide`,
  searchWrapper: `pr-3 sm:pr-4 lg:pr-6 flex items-center justify-center pointer-events-none h-[56px] sm:h-[66px]`,
  searchIcon: `h-5 w-5 sm:w-7 sm:h-7 text-secondary/[15%] smooth-transition`,
  inputButton: `group z-10 flex items-center justify-center gap-2 h-[56px] sm:h-[66px] px-8 text-secondary/60 hover:text-secondary/80 rounded-r-sm disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed smooth-transition`,
};

export const enum SearchActions {
  SET_SEARCH = 'set_search',
  SHOW_DROPDOWN = 'show_dropdown',
  HIDE_DROPDOWN = 'hide_dropdown',
  ANIMATION_ENDED = 'animation_ended',
  IS_LOADING = 'is_loading',
  IS_NOT_LOADING = 'is_not_loading',
}

export interface SearchState {
  search: string;
  showDropdown: boolean;
  searchAnimation: DropdownAnimation;
  isLoading: boolean;
}

export interface SearchAction {
  type: SearchActions;
  payload?: {
    search?: string;
  };
}

const searchReducer = (
  searchState: SearchState,
  searchAction: SearchAction
): SearchState => {
  const { type, payload } = searchAction;

  switch (type) {
    case SearchActions.SET_SEARCH:
      return { ...searchState, search: payload?.search ?? '' };

    case SearchActions.SHOW_DROPDOWN:
      return {
        ...searchState,
        showDropdown: true,
        searchAnimation: DropdownAnimation.Enter,
      };

    case SearchActions.HIDE_DROPDOWN:
      return {
        ...searchState,
        search: payload?.search ?? searchState.search,
        searchAnimation: DropdownAnimation.Exit,
      };

    case SearchActions.ANIMATION_ENDED:
      return { ...searchState, showDropdown: false };

    case SearchActions.IS_LOADING:
      return { ...searchState, isLoading: true };

    case SearchActions.IS_NOT_LOADING:
      return { ...searchState, isLoading: false };

    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
};

const initialState = {
  search: '',
  showDropdown: false,
  searchAnimation: DropdownAnimation.Default,
  isLoading: false,
};

interface SearchBarProps<T> {
  onSearch: (query: string) => Promise<ApiResponse<T | T[]>>;
  SearchItem: React.FC<{ item: T }>;
  disabled?: boolean;
  placeholder?: string;
}

export default function SearchBar<T>({
  onSearch,
  SearchItem,
  disabled,
  placeholder = 'Search...',
}: SearchBarProps<T>) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchState, searchDispatch] = useReducer(searchReducer, initialState);

  const { showDropdown, searchAnimation } = searchState;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (value.length < MIN_SEARCH_VALUE) {
      return searchDispatch({
        type: showDropdown
          ? SearchActions.HIDE_DROPDOWN
          : SearchActions.SET_SEARCH,
        payload: { search: value },
      });
    }

    searchDispatch({ type: SearchActions.IS_LOADING });

    if (!showDropdown) searchDispatch({ type: SearchActions.SHOW_DROPDOWN });

    searchDispatch({
      type: SearchActions.SET_SEARCH,
      payload: { search: e.target.value },
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.trim();

    if (!showDropdown && value.length >= MIN_SEARCH_VALUE) {
      searchDispatch({ type: SearchActions.SHOW_DROPDOWN });
    }
  };

  useEffect(() => {
    if (searchAnimation !== DropdownAnimation.Enter) return;

    function handleClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        searchDispatch({ type: SearchActions.HIDE_DROPDOWN });
      }
    }
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [searchAnimation]);

  return (
    <div ref={searchRef} className={styles.container}>
      <div
        className={cx(styles.searchContainer, {
          ['opacity-60']: disabled,
          ['opacity-100']: !disabled,
        })}
      >
        <input
          type="search"
          aria-label="search"
          disabled={disabled}
          placeholder={placeholder}
          onClick={handleClick}
          className={styles.searchInput}
          maxLength={MAX_SEARCH_LENGTH}
          onChange={handleChange}
        />

        <div className={styles.searchWrapper}>
          <MagnifyIcon className={styles.searchIcon} />
        </div>
      </div>

      <SearchDropdown<T>
        onSearch={onSearch}
        searchState={searchState}
        searchDispatch={searchDispatch}
        SearchItem={SearchItem}
      />
    </div>
  );
}
