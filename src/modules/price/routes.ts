import { Router } from "express";
import mongoose from "mongoose";
import { tokensPriceSchema } from "../../../tasks";

export const configureTokensPriceRoutes = (router: Router) => {
  /**
   * Get token price from cmc.
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/price', async (req, res) => {
    const TokenPrice = mongoose.model('tokens_price', tokensPriceSchema);
    const result = await TokenPrice.findOne({}, {_id: 0}, {sort: {timestamp: -1}})
    res.json(result);
  });
}
