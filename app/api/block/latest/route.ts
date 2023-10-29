import { NextRequest, NextResponse } from 'next/server';

import { constructExplorerURL } from '@/api/utils/blockchain';
import { isValidChain } from '@/api/utils/validation';
import { rateLimiter } from '@/api/utils/limiter';

import { ERROR_CODES } from '@/shared/constants/errorCodes';

import { BlockchainKey } from '@/types/blockchain';

async function getLatestBlock(chain: BlockchainKey): Promise<number> {
  const url = constructExplorerURL(chain, {
    module: 'proxy',
    action: 'eth_blockNumber',
  });

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.result) {
    return parseInt(data.result, 16); // Convert hex to decimal
  }

  throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
}

export async function GET(request: NextRequest) {
  const isRateLimited = rateLimiter({
    windowMs: 60 * 1000, // 1 minute in milliseconds
    max: 25, // Max number of requests in the time window
  })(request);

  if (isRateLimited instanceof NextResponse) {
    return isRateLimited;
  }

  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain');

  if (!chain || !isValidChain(chain)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_CHAIN,
      },
    });
  }

  try {
    const latestBlock = await getLatestBlock(chain);

    return NextResponse.json({
      success: true,
      data: { latestBlock },
    });
  } catch (err) {
    console.error('Error while fetching latest block', (err as Error).message);
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.UNKNOWN_ERROR,
      },
    });
  }
}
