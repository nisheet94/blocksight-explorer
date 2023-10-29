import { NextRequest, NextResponse } from 'next/server';
import { find, filter } from 'lodash';

import {
  isPartialHash,
  isValidAddress,
  isValidAmount,
  isValidBlock,
  isValidChain,
  isValidHash,
  isValidLimit,
  isValidSearchType,
} from '@/api/utils/validation';

import { ERROR_CODES } from '@/shared/constants/errorCodes';
import { VALID_SEARCH_TYPES } from '@/app/api/utils/constants';
import { getTransactionHistory } from '@/app/api/helpers/transactions';
import { UserTransaction } from '@/types/transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: { addressHash: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const address = params.addressHash?.trim();
  const chain = searchParams.get('chain');
  const startBlock = searchParams.get('startBlock');
  const endBlock = searchParams.get('endBlock');
  const type = searchParams.get('type') || VALID_SEARCH_TYPES[0];
  const value = searchParams.get('value');
  const limit = searchParams.get('limit');

  if (!value) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SEARCH_PARAMETERS,
        message: 'Value cannot be null or empty.',
      },
    });
  }

  if (!chain || !isValidChain(chain)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_CHAIN,
      },
    });
  }

  if (!isValidAddress(address, chain)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_ADDRESS,
      },
    });
  }

  if (!isValidBlock(startBlock) || !isValidBlock(endBlock)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_BLOCK_NUMBER,
      },
    });
  }

  if (!isValidLimit(limit) || !isValidSearchType(type)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SEARCH_PARAMETERS,
      },
    });
  }

  let searchResults;
  try {
    const transactions = await getTransactionHistory(
      address,
      chain,
      Number(startBlock),
      Number(endBlock)
    );

    switch (type) {
      case VALID_SEARCH_TYPES[0]: // 'txnHash'
        if (isValidHash(value, chain)) {
          const result = find(transactions, ['txnHash', value]);
          searchResults = result ? [result] : [];
        } else if (isPartialHash(value, chain)) {
          searchResults = filter(transactions, (tx: UserTransaction) =>
            tx.txnHash.startsWith(value)
          );
        } else {
          throw new Error('The provided hash format is invalid.');
        }
        break;

      case VALID_SEARCH_TYPES[1]: // 'amount'
        if (isValidAmount(value, chain)) {
          const searchValue = value.toString();
          searchResults = transactions.filter(
            (tx) => tx.amountInEth.includes(searchValue) // Change to 'includes' for partial matching
          );
        } else {
          throw new Error('The provided amount is invalid.');
        }
        break;

      default:
        throw new Error('Unsupported search type.');
    }

    searchResults = searchResults?.slice(0, Number(limit));

    return NextResponse.json({
      success: true,
      data: searchResults,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.FETCH_ERROR,
        message:
          (e as Error).message || 'An error occurred while fetching data.',
      },
    });
  }
}
