import { Router } from "express";
import { hasError } from "../../model/dataorerror";
import { apiError } from "../../utils/api";
import { updatesService } from "./updates.service";

export const configureUpdatesRoutes = (router: Router) => {
  /**
   * Checks if a given version is the most recent version of Essentials published
   * on the given platform.
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, require-await
  router.get('/updates/checkversion', async (req, res) => {
    let version = req.query.version; // Current user's app version
    let platform = req.query.platform; // User's app platform

    if (!version || typeof version !== "string")
      return res.status(400).send('Missing parameter: version');

    if (!platform || typeof platform !== "string")
      return res.status(400).send('Missing parameter: platform');

    if (!["android", "ios"].includes(platform))
      return res.status(400).send('Invalid platform. Should be android or ios');

    let resultOrError = updatesService.checkVersion(version, platform);
    if (hasError(resultOrError))
      return apiError(res, resultOrError);

    res.json(resultOrError.data);
  });
}