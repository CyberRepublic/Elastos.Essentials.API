import mongoose from "mongoose";
import fetch from "node-fetch";
import { SecretConfig } from "./src/config/env-secret";

export type ChainIdList = {
  [chain: string]: number;
}

//https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest
export type CMCResponse = {
  status: {
    timestamp: string, //"2023-12-04T03:49:28.665Z",
    error_code: number,
    error_message: string,
    elapsed: number,
    credit_count: number,
    notice: string
  }
  data: any // TODO
}

// Token market cap rank <= 130
const tokens1: ChainIdList = {
  BTC: 1,
  BNB: 1839,
  HT: 2502,
  AVAX: 5805,
  ETH: 1027,
  FTM: 3513,
  MATIC: 3890,
  CRO: 3635,
  KAVA: 4846,
  TRX: 1958,
  BTT: 16086,
};

// Token market cap rank > 130
const tokens2: ChainIdList = {
  EVMOS: 19899,
  FSN: 2530,
  ELA: 2492,
  TLOS: 4660,
  FUSE: 5634,
  xDAI: 8635,
  IOTX: 2777,
  CELO: 5567,
  USDT: 825
};

// TODO: move to modules/price
class Tasks {
    run() {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval( async () => {
            try {
              await this.fetchTokensPrice()
            } catch (e) {
              console.warn('Failed to fetch token price:', e)
            }
        }, 1000 * 60 * 5)
    }

    // TODO: Using one API call to obtain the prices of all tokens
    async fetchTokensPrice() {
        const cmcKeys = SecretConfig.CmcApiKey
        if (cmcKeys.length === 0) {
            return;
        }

        const x = Math.floor(Math.random() * cmcKeys.length);
        const headers = { 'Content-Type': 'application/json', 'X-CMC_PRO_API_KEY': cmcKeys[x] };
        const res = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=130',
            { method: 'get', headers },
        );
        const result = await res.json() as CMCResponse;
        const record = { timestamp: Date.parse(result.status.timestamp) } as any;
        result.data.forEach((item: { symbol: string | number; id: any; quote: { USD: { price: any; }; }; }) => {
            if (tokens1[item.symbol] === item.id) {
                record[item.symbol] = item.quote.USD.price;
            }
        });

        let getTokensPriceUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id='
        for (const i in tokens2) {
            getTokensPriceUrl += tokens2[i] + ','
        }
        // Remove the last ','
        getTokensPriceUrl = getTokensPriceUrl.substring(0, getTokensPriceUrl.length - 1);

        const resOther = await fetch(
            getTokensPriceUrl, { method: 'get', headers },
        );
        const resultOther = await resOther.json()  as CMCResponse;

        for (const i in tokens2) {
          if (resultOther.data[tokens2[i]]) {
            record[i] = resultOther.data[tokens2[i]].quote?.USD?.price
          }
        }

        // for (const i in tokens2) {
        //     const resOther = await fetch(
        //         `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1&convert_id=${tokens2[i]}`,
        //         { method: 'get', headers },
        //     );
        //     const resultOther = await resOther.json();

        //     if (resultOther.data[0].id === 1) {
        //         const priceAtBTC = resultOther.data[0].quote[tokens2[i]].price;
        //         record[i] = record['BTC'] / priceAtBTC;
        //     } else {
        //         console.error(`[Get CMC PRICE] the base coin changed`);
        //     }
        // }
        // console.log('Tokens price:', record)

        const Record = mongoose.model('tokens_price', tokensPriceSchema);
        const tokensPrice = new Record(record);
        await tokensPrice.save()
    }
}

export const tokensPriceSchema = new mongoose.Schema({timestamp:Number,BTC:Number,ETH:Number,BNB:Number,TRX:Number,AVAX:Number,MATIC:Number,CRO:Number,FTM:Number,KAVA:Number,BTT:Number,HT:Number,EVMOS:Number,FSN:Number,ELA:Number,TLOS:Number,FUSE:Number,xDAI:Number,IOTX:Number,CELO:Number, USDT:Number}, { versionKey: false });
export const tasks = new Tasks();
