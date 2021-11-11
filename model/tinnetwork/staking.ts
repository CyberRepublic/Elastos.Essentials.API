export type StakedAssets = {
  updatedAt: number; // Timestamp (sec) at which the VALUE of staked assets for an address/chainid was last checked
  amount: number;
};

export type StakingFarmCacheEntry = {
  farm: string; // Farm name
  assetsStaked: boolean; // Whether the address has assets in this farm for this chain or not
  assets: StakedAssets;
}

export type StakingFarmCacheEntries = {
  updatedAt: number; // Timestamp (sec) at which the PRESENCE of staked assets for an address/chainid was last checked
  farms: {
    [farmName: string]: StakingFarmCacheEntry
  };
}

export type StakedAssetsCacheEntry = {
  fetchInProgress: boolean; // Indicate if the external staking api is currently being fetched. Used to avoid duplicated fetches if our api is called many times at once
  chains: {
    [chainId: number]: StakingFarmCacheEntries
  };
}

/**
 * In memory cache of discovered farms used by an address
 */
/* export type StakingFarmsCache = {
  [address: string]: StakingFarmCacheEntry[];
} */

// In memory cache for users assets
export type StakedAssetsCache = {
  [address: string]: StakedAssetsCacheEntry;
}