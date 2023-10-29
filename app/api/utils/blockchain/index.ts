import { BlockchainKey } from '@/types/blockchain';

const etherscanApiKey = process.env.etherscanKey;
const polygonscanApiKey = process.env.polygonscanKey;

if (!etherscanApiKey || !polygonscanApiKey) {
  throw new Error(
    'Environment variables for PolygonScan or EtherScan is not set.'
  );
}

export const ethereum = {
  apiUrl: `https://api.etherscan.io/api`,
  apiKey: etherscanApiKey,
};

export const polygon = {
  apiUrl: `https://api.polygonscan.com/api`,
  apiKey: polygonscanApiKey,
};

function getBlockchain(chain: BlockchainKey) {
  switch (chain) {
    case 'ethereum':
      return ethereum;
    case 'polygon':
      return polygon;
    default:
      throw new Error(`Unsupported chain ${chain}`);
  }
}

export function constructExplorerURL(
  chain: BlockchainKey,
  params: {
    module: string;
    action: string;
    address?: string;
    startBlock?: string;
    endBlock?: string;
    sort?: string;
    page?: string;
    offset?: string;
  }
): URL {
  const { apiUrl, apiKey } = getBlockchain(chain);

  // Merging apiKey into params
  const fullParams = { ...params, apiKey };

  const url = new URL(apiUrl);
  for (const [key, value] of Object.entries(fullParams)) {
    if (value) {
      // only add parameters that have values
      url.searchParams.append(key, value);
    }
  }
  return url;
}
