import { NextRequest, NextResponse } from 'next/server';
import { sort } from 'fast-sort';
import { orderBy } from 'lodash';

import { getTransactionHistory } from '@/app/api/helpers/transactions';

import {
  isValidAddress,
  isValidBlock,
  isValidChain,
  isValidLimit,
  isValidNumber,
  isValidSortBy,
  isValidSortOrder,
} from '@/api/utils/validation';

import { VALID_SORT_ORDERS, VALID_SORT_TYPES } from '@/api/utils/constants';
import { rateLimiter } from '@/app/api/utils/limiter';

import { ERROR_CODES } from '@/shared/constants/errorCodes';

import { UserTransaction } from '@/types/transaction';

type ValidSortType = (typeof VALID_SORT_TYPES)[number];
type ValidSortOrder = (typeof VALID_SORT_ORDERS)[number];

function sortData(
  data: UserTransaction[],
  key: ValidSortType,
  order: ValidSortOrder
) {
  return orderBy(data, [key], [order]);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { addressHash: string } }
) {
  const isRateLimited = rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Allow up to 100 requests within the 10-minute window
  })(request);

  if (isRateLimited instanceof NextResponse) {
    return isRateLimited;
  }

  const searchParams = request.nextUrl.searchParams;
  const address = params.addressHash?.trim();
  const chain = searchParams.get('chain');
  const startBlock = searchParams.get('startBlock');
  const endBlock = searchParams.get('endBlock');
  const sortBy = searchParams.get('sortBy') || VALID_SORT_TYPES[0];
  const sortOrder = searchParams.get('sortOrder') || VALID_SORT_ORDERS[0];
  const skip = searchParams.get('skip');
  const limit = searchParams.get('limit');

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

  if (
    !isValidSortBy(sortBy) ||
    !isValidSortOrder(sortOrder) ||
    !isValidNumber(skip) ||
    !isValidLimit(limit)
  ) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_SORT_PARAMETERS,
      },
    });
  }

  try {
    let transactions = await getTransactionHistory(
      address,
      chain,
      Number(startBlock),
      Number(endBlock)
    );

    if (sortBy === VALID_SORT_TYPES[0]) {
      transactions =
        sortOrder === VALID_SORT_ORDERS[1]
          ? sort(transactions).asc([(u) => u.timestamp || 0])
          : sort(transactions).desc([(u) => u.timestamp || 0]);
    } else {
      // Assuming sortBy is 'amount'
      transactions =
        sortOrder === VALID_SORT_ORDERS[1]
          ? sort(transactions).asc([(u) => parseFloat(u.amountInEth)])
          : sort(transactions).desc([(u) => parseFloat(u.amountInEth)]);
    }

    // const sortedTransactions = sortData(transactions, sortBy, sortOrder);

    transactions = transactions.slice(
      Number(skip),
      Number(skip) + Number(limit)
    );

    return NextResponse.json({
      success: true,
      data: { transactions },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.FETCH_ERROR,
      },
    });
  }
}
