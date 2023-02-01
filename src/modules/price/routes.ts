import { Router } from "express";
import mongoose from "mongoose";
import {tokensPriceSchema} from "../../../tasks";

export const configureTokensPriceRoutes = (router: Router) => {
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
  router.post('/price', async (req, res) => {

    const TokenPrice = mongoose.model('tokens_price', tokensPriceSchema);
    const result = await TokenPrice.findOne({}, {_id: 0}, {sort: {timestamp: -1}})
    res.json(result);
  });
}
