/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { configureMultiSigRoutes } from './modules/multisig/routes';
import { configureStakingRoutes } from './modules/staking/routes';
import { configureUpdatesRoutes } from './modules/updates/routes';

let router = Router();

/**
 * Returns the service status (running well or not).
 */
router.get('/status', (req, res) => {
    res.json({ status: "ok" });
});

configureStakingRoutes(router);
configureMultiSigRoutes(router);
configureUpdatesRoutes(router);

export default router;
