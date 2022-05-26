import { Router } from "express";
import { hasError, invalidParamError } from "../../model/dataorerror";
import { apiError } from "../../utils/api";
import { multiSigService } from "./multisig.service";
import { DeleteMultiSigTransactionResponse, GetMultiSigTransactionResponse, PostMultiSigTransactionResponse } from "./responses";

export const configureMultiSigRoutes = (router: Router) => {
  /**
   * Finds a multisig transaction by key
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.delete<void, DeleteMultiSigTransactionResponse>('/multisig/transaction', async (req, res) => {
    let transactionKey = <string>req.query.key;

    if (!transactionKey)
      return apiError(res, invalidParamError("key is missing"));

    let resultOrError = await multiSigService.deleteTransaction(transactionKey);
    if (hasError(resultOrError))
      return apiError(res, resultOrError);

    res.json({});
  });
}