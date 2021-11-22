/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { defiService } from '../services/tinnetwork.service';

let router = Router();

/**
 * Returns the service status (running well or not).
 */
router.get('/status', (req, res) => {
    res.json({ status: "ok" });
});

/**
 * Returns assets staking information for a given EVM address.
 */
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

export default router;
