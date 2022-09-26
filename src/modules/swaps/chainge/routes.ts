import { Router } from "express";
import { SecretConfig } from "../../../config/env-secret";
import { chaingeSwapService } from "./chainge.service";

export const configureChaingeSwapRoutes = (router: Router) => {
  /**
   * Signs a given payload with our chainge app key and app secret. This payload
   * comes from a cross chain swap request from Essentials, and the signature is used
   * to make sure that we allow this transaction to be executed (even thought we are
   * not protecting anything here as anyone can call this endpoint... but this is required)
   * by chainge.
   *
   * Documentation at: https://chainge-finance.gitbook.io/chainge-sdk/integrate-chainge-js-sdk/set-up-the-service
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, require-await
  router.post('/swaps/chainge/signpayload', async (req, res) => {
    if (!req.header("expireTime"))
      return res.status(400).send('Missing header: expireTime');

    if (!req.header("timestamp"))
      return res.status(400).send('Missing header: timestamp');

    const bodyParams = req.body;

    const sign = chaingeSwapService.generateSignature(bodyParams, {
      expireTime: req.header("expireTime"),
      timestamp: req.header("timestamp")
    });

    res.json({
      appKey: SecretConfig.Chainge.appKey,
      sign: sign.toString()
    });
  });
}