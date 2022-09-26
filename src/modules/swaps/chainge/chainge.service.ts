import CryptoJS from "crypto-js";
import { SecretConfig } from "../../../config/env-secret";

export type HttpKeyValue = {
  [key: string]: string | number;
}

class ChaingeSwapService {
  /**
   * @param paramJson ?
   * @param headers Must contain only 'expireTime' and 'timestamp'
   * @returns
   */
  public generateSignature(paramJson: HttpKeyValue, headers: HttpKeyValue) {
    const appKey = SecretConfig.Chainge.appKey;
    const appSecret = SecretConfig.Chainge.appSecret;

    // BODY
    let strBody = "";
    let keysBody = Object.keys(paramJson);
    keysBody = keysBody.sort();
    for (const key of keysBody) {
      const val = paramJson[key];
      strBody += `${key}=${val}`;
    }

    let param = Object.assign({}, headers, {
      appKey,
    });

    // HEADER
    let strHeader = "";
    let headerKeys = Object.keys(param);
    headerKeys = headerKeys.sort();
    for (const key of headerKeys) {
      if (key !== "signature") {
        const val = param[key];
        strHeader += `${key}=${val}`;
      }
    }

    const str = strBody + strHeader;

    const sign = CryptoJS.HmacSHA256(str, appSecret);
    return sign;
  }
}

export const chaingeSwapService = new ChaingeSwapService();