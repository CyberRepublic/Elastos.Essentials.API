/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { hasError, invalidParamError } from '../model/dataorerror';
import { multiSigService } from '../services/multisig.service';
import { defiService } from '../services/tinnetwork.service';
import { apiError } from '../utils/api';
import { DeleteMultiSigTransactionResponse, GetMultiSigTransactionResponse, PostMultiSigTransactionResponse } from './responses';

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

/**
 * Finds a multisig transaction by key
 */
router.get<void, GetMultiSigTransactionResponse>('/multisig/transaction', async (req, res) => {
    let transactionKey = <string>req.query.key;

    if (!transactionKey)
        return apiError(res, invalidParamError("key is missing"));

    let txOrError = await multiSigService.getTransactionBykey(transactionKey);
    if (hasError(txOrError))
        return apiError(res, txOrError);

    if (txOrError.data === null)
        return apiError(res, invalidParamError(`No transaction found for transaction key ${transactionKey}`));
    else
        res.json(txOrError.data);
});

/**
 * Upserts a multisig transaction by key.
 */
router.post<void, PostMultiSigTransactionResponse, { tx: any; network: string }>('/multisig/transaction', async (req, res) => {
    let transactionKey = <string>req.query.key;

    if (!transactionKey)
        return apiError(res, invalidParamError("key is missing"));

    if (!req.body.tx)
        return apiError(res, invalidParamError("tx is missing in the body"));

    if (!req.body.network)
        return apiError(res, invalidParamError("network is missing in the body"));

    let resultOrError = await multiSigService.upsertTransaction(transactionKey, req.body.tx, req.body.network);
    if (hasError(resultOrError))
        return apiError(res, resultOrError);

    res.json({});
});

/**
 * Deletes a multisig transaction by key.
 */
router.delete<void, DeleteMultiSigTransactionResponse>('/multisig/transaction', async (req, res) => {
    let transactionKey = <string>req.query.key;

    if (!transactionKey)
        return apiError(res, invalidParamError("key is missing"));

    let resultOrError = await multiSigService.deleteTransaction(transactionKey);
    if (hasError(resultOrError))
        return apiError(res, resultOrError);

    res.json({});
});

export default router;
