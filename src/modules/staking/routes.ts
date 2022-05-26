import { Router } from "express";
import { defiService } from "./tinnetwork.service";

export const configureStakingRoutes = (router: Router) => {
  /**
   * Returns assets staking information for a given EVM address.
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/assets/staking', async (req, res) => {
    let address = req.query.address;
    let chainId = parseInt(req.query.chainid as string);

    if (!address || typeof address !== "string")
      return res.status(400).send('Missing parameter: address');

    if (!chainId)
      return res.status(400).send('Missing parameter: chainid');

    let stakedAssets = await defiService.getStakedAssets(address, chainId);

    res.json(stakedAssets || []);
  });
}