import { EtherIcon, PolygonIcon } from '@/components/shared/icons';

import { Blockchains } from '@/types/blockchain';

export const blockchains: Blockchains = {
  ethereum: {
    name: 'ethereum',
    network: 'ethereum',
    currency: 'ETH',
    Icon: EtherIcon,
    explorer_url: 'https://etherscan.io',
  },

  polygon: {
    name: 'polygon',
    network: 'matic-network',
    currency: 'MATIC',
    Icon: PolygonIcon,
    explorer_url: 'https://polygonscan.com/',
  },

  // ... And so on
};
