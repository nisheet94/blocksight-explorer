interface FetchTransactionsOptions {
  addressHash: string;
  chain: string;
  sortState?: { key: string; order: string };
  endBlock: number | null;
  limit: number;
  skip?: number;
}

export async function fetchTransactions({
  addressHash,
  chain,
  endBlock,
  sortState,
  limit = 10,
  skip,
}: FetchTransactionsOptions): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    let url = `/api/user/${addressHash}/transactions?chain=${chain}`;

    // Start block is always set to "earliest" by default
    url += `&startBlock=0`;

    // End block
    if (endBlock !== undefined) {
      url += `&endBlock=${endBlock}`;
    }

    if (sortState) {
      url += `&sortBy=${sortState.key}&sortOrder=${sortState.order}`;
    }

    // Amount of transactions to skip
    if (skip !== undefined) {
      url += `&skip=${skip}`;
    }

    // Amount of transactions to fetch
    if (limit !== undefined) {
      url += `&limit=${limit}`;
    }

    const response = await fetch(url);
    const { success, data, error } = await response.json();

    if (response.ok) {
      return { success, data };
    } else {
      return { success, error };
    }
  } catch (e) {
    console.error('Error fetching transaction:', (e as Error).message);
    throw e;
  }
}
