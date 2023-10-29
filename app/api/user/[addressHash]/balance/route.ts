import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

import { constructExplorerURL } from '@/api/utils/blockchain';
import { isValidAddress, isValidChain } from '@/api/utils/validation';
import { rateLimiter } from '@/app/api/utils/limiter';

import { ERROR_CODES } from '@/shared/constants/errorCodes';

import { BlockchainKey } from '@/types/blockchain';

async function getWalletDetails(
  address: string,
  chain: BlockchainKey
): Promise<any> {
  const balanceUrl = constructExplorerURL(chain, {
    module: 'account',
    action: 'balance',
    address: address,
  });

  const balanceResponse = await fetch(balanceUrl.toString());
  const balanceData = await balanceResponse.json();

  if (balanceData.status !== '1') {
    throw new Error('Failed to fetch balance');
  }
  const balance = balanceData.result;

  const txnCountUrl = constructExplorerURL(chain, {
    module: 'account',
    action: 'txlist',
    address: address,
    page: '1',
    offset: '1', // Limit to 1 transaction just to get the total count
  });

  const txnCountResponse = await fetch(txnCountUrl.toString());
  const txnCountData = await txnCountResponse.json();

  if (txnCountData.status !== '1') {
    throw new Error('Failed to fetch transaction count');
  }

  const txnCount =
    txnCountData.result.length > 0 ? txnCountData.result[0].nonce : 0;

  return { balance, txnCount };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { addressHash: string } }
) {
  const isRateLimited = rateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes in milliseconds
    max: 25, // Max number of requests in the time window
  })(request);

  if (isRateLimited instanceof NextResponse) {
    return isRateLimited;
  }

  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain');
  const address = params.addressHash?.trim();

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

  try {
    const { balance, txnCount } = await getWalletDetails(address, chain);

    return NextResponse.json({
      success: true,
      data: {
        balance: ethers.formatEther(balance.toString()),
        txnCount,
      },
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
