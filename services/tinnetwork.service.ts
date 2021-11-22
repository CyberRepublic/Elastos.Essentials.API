import fetch from "node-fetch";
import { SecretConfig } from "../config/env-secret";
import { SummarizedStakedAssets, TinAssetsResponse } from "../model/tinnetwork/assets";
import { TinChain, TinChainsResponse } from "../model/tinnetwork/chains";
import { TinFarm, TinFarmsResponse } from "../model/tinnetwork/farms";
import { StakedAssetsCache } from "../model/tinnetwork/staking";

const STAKED_ASSETS_FARMS_CACHE_DURATION_SEC = (24 * 60 * 60); // 1 day to re-check possible farms where an address has assets
const STAKED_ASSETS_ASSETS_CACHE_DURATION_SEC = (10 * 60); // 10 minutes to refresh value of stakes assets fo a known farm

const stakedAssetsCache: StakedAssetsCache = {}; // Empty cache when the service starts

/**
 * TIN Network API documentation: https://openapi.tin.network/
 */
class TinNetworkService {
  private tinFarms: TinFarm[];
  private tinChains: TinChain[];

  public async setup() {
    console.log("TIN Network service setup");

    // Load the whole list of available farms and save it. Updated only once per service start
    await Promise.all([
      this.fetchFarmsList(),
      this.fetchChainsList()
    ]);
  }

  private async fetchFarmsList(): Promise<void> {
    // This api returns all the farms at once
    console.log("Fetching TIN farms list");
    try {
      let response = await fetch(`${SecretConfig.TinNetwork.apiEndpoint}/farms`);
      if (response.ok) {
        let farms = await response.json() as TinFarmsResponse;
        this.tinFarms = farms.data;

        console.log(`Fetched ${this.tinFarms.length} TIN farms`);
      }
      else {
        console.error("TIN Network farms list couldn't be fetched! Staking info won't be available!");
      }
    }
    catch (e) {
      console.error(e);
      console.error("TIN Network farms list couldn't be fetched! Staking info won't be available!");
    }
  }

  private async fetchChainsList() {
    console.log("Fetching TIN chains list");
    try {
      let response = await fetch(`${SecretConfig.TinNetwork.apiEndpoint}/chains`);
      if (response.ok) {
        let farms = await response.json() as TinChainsResponse;
        this.tinChains = farms.data;

        console.log(`Fetched ${this.tinChains.length} TIN chains`);
      }
      else {
        console.error("TIN Network chains list couldn't be fetched! Staking info won't be available!");
      }
    }
    catch (e) {
      console.error(e);
      console.error("TIN Network chains list couldn't be fetched! Staking info won't be available!");
    }
  }

  /**
   * Returns staked assets for a given address from the cache.
   * If the information is too old, we fetch fresh information from an external staking API.
   *
   * https://openapi.tin.network/v1/chains
   * https://openapi.tin.network/v1/farms
   * https://openapi.tin.network/v1/users/farms/{address}?farms={farm-shortName}&chainId={chainId}
   *
   * header: {
   *  X-API-KEY: {YOUR-ACCESS-TOKEN}
   * }
   *
   * NOTES:
   * - the /farms api requires to pass a chain id and a list of farms. Tin network api is far from being optimized.
   * - So we need to manually discover which farms an address is in and then query assets for those farms for a given network.
   * - It is recommended to pass a list of 1-4 farms max per query, because a long list of farms may be slow
   * - Note that each "farm" can exist on several networks
   */
  public async getStakedAssets(address: string, chainId: number): Promise<SummarizedStakedAssets[] | null> {
    // Create an entry for this address if we don't have one
    if (!(address in stakedAssetsCache)) {
      stakedAssetsCache[address] = {
        fetchInProgress: false,
        chains: {}
      };
    }

    let addressCache = stakedAssetsCache[address];

    // Fetch on going, don't fetch multiple times, just return the cache
    if (addressCache.fetchInProgress)
      return null;

    if (this.tinChains.findIndex(c => c.chainId === chainId) === -1) {
      // requested chain id doesn't exist on tin network
      return null;
    }

    addressCache.fetchInProgress = true;

    // Make sure that we checked chains in which this address is recently enough
    if (!(chainId in addressCache.chains)) {
      addressCache.chains[chainId] = {
        updatedAt: 0,
        farms: {}
      }
    }

    let fetchAllFarms = false;
    if (addressCache.chains[chainId].updatedAt + STAKED_ASSETS_FARMS_CACHE_DURATION_SEC < (Date.now() / 1000)) {
      console.log(`no cache or cache expired for address ${address} for chain ${chainId}. Fetching all farms`);
      fetchAllFarms = true;
    }

    // Chain id unknown yet or cache expired - fetch farms for this chains for this address.
    // We should check all farms for this chain.
    let userChains = addressCache.chains[chainId];
    let farmsForThisChain = this.getFarmsForChain(chainId);

    console.log("Number of farms to check: " + farmsForThisChain.length);
    for (let farm of farmsForThisChain) {
      if (!(farm.shortName in userChains.farms)) {
        userChains.farms[farm.shortName] = {
          assetsStaked: false,
          farm: farm.shortName,
          assets: {
            updatedAt: 0,
            amount: 0
          }
        }
      }

      if (fetchAllFarms || (userChains.farms[farm.shortName].assetsStaked && userChains.farms[farm.shortName].assets.updatedAt + STAKED_ASSETS_ASSETS_CACHE_DURATION_SEC < (Date.now() / 1000))) {
        let userFarm = userChains.farms[farm.shortName];
        console.log(`no cache or cache expired for address ${address} for chain ${chainId} for farm ${farm.shortName}`);
        // No assets fetched or expired assets, fetch them all for this chain.
        let farmValue = await this.fetchFarmAssets(address, farm, chainId);
        if (farmValue !== null) { // null probably means error. So we just don't remember this attempt and we'll try again next time
          console.log("farmValue", farmValue);
          userFarm.assetsStaked = farmValue > 0;
          userFarm.assets = {
            updatedAt: Date.now() / 1000,
            amount: farmValue
          };
        }
      }
    }

    // If we really fetched all farms, we save this date as last updated date for this chainid
    if (fetchAllFarms)
      addressCache.chains[chainId].updatedAt = Date.now() / 1000;

    addressCache.fetchInProgress = false;

    console.log("addressCache", addressCache.chains[chainId]);

    let userFarmKeys = Object.keys(addressCache.chains[chainId].farms);
    let summarizedAssets: SummarizedStakedAssets[] = userFarmKeys.map(farmShortName => {
      let userFarm = addressCache.chains[chainId].farms[farmShortName];
      let tinFarm = this.getTinFarmByShortName(farmShortName);
      return {
        farmName: tinFarm.name,
        farmShortName: tinFarm.shortName,
        farmUrl: tinFarm.url,
        farmIconUrl: `https://api.tin.network/icons/farms/${tinFarm.icon}.png`,
        amountUSD: userFarm.assets.amount,
        lastUpdated: userFarm.assets.updatedAt
      }
    });

    return summarizedAssets;
  }

  private getTinFarmByShortName(shortName: string): TinFarm {
    return this.tinFarms.find(tf => tf.shortName === shortName);
  }

  private getFarmsForChain(chainId: number): TinFarm[] {
    return this.tinFarms.filter(tf => tf.chainIds.indexOf(chainId) >= 0);
  }

  private async fetchFarmAssets(address: string, farm: TinFarm, chainId: number): Promise<number | null> {
    console.log(`Fetching staked assets for address ${address}, farm ${farm.shortName}, chain ${chainId}`);

    try {
      let response = await fetch(`${SecretConfig.TinNetwork.apiEndpoint}/users/farms/${address}?chainId=${chainId}&farms=${farm.shortName}`, {
        headers: {
          "X-API-KEY": SecretConfig.TinNetwork.apiKey
        }
      });

      if (response.ok) {
        let assets = await response.json() as TinAssetsResponse;
        //console.log("tin assets", assets);

        // Normally only 1 item in "data" as we filtered with a single farm but let's loop.
        let amount = 0;
        for (let asset of assets.data) {
          // In case of error, the amount can be null or undefined in tin api.
          if (asset.amountPrice === undefined || asset.amountPrice === null) {
            console.log("fetchFarmAssets KO - unknown amount price", asset.amountPrice);
            return null;
          }
          else {
            amount = amount + asset.amountPrice;
          }
        }

        return amount;
      }
      else {
        console.log("fetchFarmAssets KO", response.statusText);
        return null;
      }
    }
    catch (e) {
      console.error(e);
      console.log("fetchFarmAssets KO");
      return null;
    }
  }
}

export const defiService = new TinNetworkService();