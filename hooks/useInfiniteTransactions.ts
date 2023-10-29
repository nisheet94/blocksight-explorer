import { useRef, useEffect, useReducer, useCallback } from 'react';

import { UserTransaction } from '@/types/transaction';
import { fetchTransactions } from '@/services/fetchTransactions';

export interface LoaderState {
  start: number;
  results: UserTransaction[];
  isLoading: boolean;
  hasMoreTransactions: boolean;
}

export interface LoaderAction {
  type: LoaderActions;
  payload?: {
    start?: number;
    results?: UserTransaction[];
    isLoading?: boolean;
    hasMoreTransactions?: boolean;
  };
}

export const enum LoaderActions {
  SET_START = 'set_start',
  SET_RESULTS = 'set_results',
  IS_LOADING = 'is_loading',
  RESET_STATE = 'reset_state',
  SET_LATEST_BLOCK = 'set_latest_block',
}

const initialState: LoaderState = {
  start: 0,
  results: [],
  isLoading: true,
  hasMoreTransactions: false,
};

function loaderReducer(
  loaderState: LoaderState,
  loaderAction: LoaderAction
): LoaderState {
  const { type, payload } = loaderAction;

  switch (type) {
    case LoaderActions.SET_START:
      return { ...loaderState, start: payload?.start ?? loaderState.start };

    case LoaderActions.SET_RESULTS:
      return {
        ...loaderState,
        results: payload?.results ?? loaderState.results,
        hasMoreTransactions:
          payload?.hasMoreTransactions ?? loaderState.hasMoreTransactions,
        isLoading: false,
      };

    case LoaderActions.IS_LOADING:
      return { ...loaderState, isLoading: true };

    case LoaderActions.RESET_STATE:
      return { ...initialState };

    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

type UseInfiniteTransactionsProps = {
  addressHash: string;
  amount: number;
  chain: string;
  sortState: {
    key: string;
    order: 'asc' | 'desc';
  };
  endBlock: number | null;
};

const useInfiniteTransactions = ({
  addressHash,
  amount,
  chain,
  sortState,
  endBlock,
}: UseInfiniteTransactionsProps) => {
  const [loaderState, dispatch] = useReducer(loaderReducer, initialState);
  const timerId = useRef<number | NodeJS.Timeout | null>(null);

  const fetchMore = useCallback(() => {
    dispatch({
      type: LoaderActions.SET_START,
      payload: { start: loaderState.start + amount },
    });
  }, [dispatch, loaderState.start, amount]);

  useEffect(() => {
    if (timerId.current) clearTimeout(timerId.current);
    dispatch({ type: LoaderActions.RESET_STATE });
  }, [chain, sortState]);

  useEffect(() => {
    const controller = new AbortController();
    let isSubscribed = true;

    const getData = async () => {
      if (!loaderState.isLoading) dispatch({ type: LoaderActions.IS_LOADING });

      try {
        const { success, data, ...rest } = await fetchTransactions({
          addressHash,
          chain,
          endBlock: endBlock,
          sortState: sortState,
          limit: amount,
          skip: loaderState.start,
        });

        if (success && data.transactions?.length > 0) {
          const results =
            loaderState.start === 0
              ? [...data.transactions]
              : [...loaderState.results, ...data.transactions];

          if (isSubscribed) {
            dispatch({
              type: LoaderActions.SET_RESULTS,
              payload: {
                results: results,
                hasMoreTransactions: data.transactions.length === amount,
              },
            });
          }
        } else {
          if (isSubscribed) {
            dispatch({
              type: LoaderActions.SET_RESULTS,
              payload: {
                results: [...loaderState.results],
                hasMoreTransactions: false,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    if (endBlock) {
      timerId.current = setTimeout(getData, 350);
    }

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
      isSubscribed = false;
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderState.start, endBlock]);

  return { ...loaderState, fetchMore };
};

export default useInfiniteTransactions;
