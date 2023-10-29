import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

import { rateLimiter } from '@/api/utils/limiter';

import { blockchains } from '@/utils/constants/blockchains';
import { BlockchainKey } from '@/types/blockchain';

import { isValidChain, isValidHash } from '@/api/utils/validation';
import { ERROR_CODES } from '@/shared/constants/errorCodes';

const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${process.env.projectId}`;
const POLYGON_RPC_URL = `https://polygon-mainnet.infura.io/v3/${process.env.projectId}`;

if (!process.env.projectId) {
  throw new Error('Environment variable projectId is not set.');
}

const ethereumProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
const polygonProvider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

async function getCurrentCryptoPriceInUSD(network: string): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/coins/${network}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.market_data.current_price.usd ?? 0;
  } catch (error) {
    throw new Error('Failed fetching crypto price.');
  }
}

async function getTransactionDetails(
  provider: ethers.JsonRpcProvider,
  txnHash: string,
  chain: BlockchainKey
) {
  const network = blockchains[chain].network;
  const cryptoPriceInUSD = await getCurrentCryptoPriceInUSD(network);

  const transaction = await provider.getTransaction(txnHash);

  if (!transaction) {
    throw new Error('Transaction not found.');
  }

  const amountInEth = ethers.formatEther(transaction.value);
  const amountInUsd = (parseFloat(amountInEth) * cryptoPriceInUSD).toFixed(2);

  const details = {
    txnHash: transaction.hash,
    from: transaction.from,
    to: transaction.to,
    amountInEth,
    amountInUsd,
    gasPriceInGwei: ethers.formatUnits(transaction.gasPrice, 'gwei'),
    gasFeeInEth: ethers.formatEther(transaction.gasPrice),
  };

  // For pending transaction
  if (!transaction.blockNumber) {
    const txnFeeInEth = ethers.formatEther(
      BigInt(transaction.gasLimit) * BigInt(transaction.gasPrice)
    );
    const txnFeeInUSD = (parseFloat(txnFeeInEth) * cryptoPriceInUSD).toFixed(2);

    return {
      ...details,
      status: 'pending',
      blockNumber: null,
      timestamp: null,
      txnFeeInEth,
      txnFeeInUSD,
    };
  }

  const receipt = await provider.getTransactionReceipt(txnHash);
  const block = await provider.getBlock(transaction.blockNumber);

  if (!receipt || receipt.status === null) {
    throw new Error('Transaction receipt not found or invalid.');
  }

  if (!block) {
    throw new Error('Block information not found.');
  }

  const txnFeeInEth = ethers.formatEther(
    BigInt(receipt.gasUsed) * BigInt(transaction.gasPrice)
  );
  const txnFeeInUSD = (parseFloat(txnFeeInEth) * cryptoPriceInUSD).toFixed(2);

  return {
    ...details,
    status: receipt.status === 1 ? 'success' : 'failed',
    blockNumber: transaction.blockNumber,
    timestamp: block.timestamp,
    txnFeeInEth,
    txnFeeInUSD,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionHash: string } }
) {
  const isRateLimited = rateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes in milliseconds
    max: 10, // Max number of requests in the time window
  })(request);

  if (isRateLimited instanceof NextResponse) {
    return isRateLimited;
  }

  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain');
  const hash = params.transactionHash?.trim();

  if (!chain || !isValidChain(chain)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_CHAIN,
      },
    });
  }

  if (!isValidHash(hash, chain)) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_HASH,
      },
    });
  }

  try {
    let transactionDetails;
    if (chain === 'ethereum') {
      transactionDetails = await getTransactionDetails(
        ethereumProvider,
        String(hash),
        chain
      );
    } else if (chain === 'polygon') {
      transactionDetails = await getTransactionDetails(
        polygonProvider,
        String(hash),
        chain
      );
    } else {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.FETCH_ERROR,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...transactionDetails },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.UNKNOWN_ERROR,
      },
    });
  }
}
