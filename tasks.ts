import {SecretConfig} from "./src/config/env-secret";
import mongoose from "mongoose";

class Tasks {
    run() {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval( async () => {
            const cmcKeys = SecretConfig.CmcApiKey
            if (cmcKeys.length === 0) {
                return;
            }

            const tokens1 = {
                BTC: 1,
                BNB: 1839,
                HT: 2502,
                AVAX: 5805,
                ETH: 1027,
                FTM: 3513,
                MATIC: 3890,
                CRO: 3635,
                KAVA: 4846,
            } as any;
            const tokens2 = {
                EVMOS: 19899,
                FSN: 2530,
                ELA: 2492,
                TLOS: 4660,
                FUSE: 5634,
                HOO: 7543,
                xDAI: 8635,
                IOTX: 2777,
            } as any;

            const x = Math.floor(Math.random() * cmcKeys.length);
            const headers = { 'Content-Type': 'application/json', 'X-CMC_PRO_API_KEY': cmcKeys[x] };
            const res = await fetch(
                'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=110',
                { method: 'get', headers },
            );
            const result = await res.json();

            const record = { timestamp: Date.parse(result.status.timestamp) } as any;
            result.data.forEach((item: { symbol: string | number; id: any; quote: { USD: { price: any; }; }; }) => {
                if (tokens1[item.symbol] === item.id) {
                    record[item.symbol] = item.quote.USD.price;
                }
            });

            for (const i in tokens2) {
                const resOther = await fetch(
                    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1&convert_id=${tokens2[i]}`,
                    { method: 'get', headers },
                );
                const resultOther = await resOther.json();

                if (resultOther.data[0].id === 1) {
                    const priceAtBTC = resultOther.data[0].quote[tokens2[i]].price;
                    record[i] = record['BTC'] / priceAtBTC;
                } else {
                    console.error(`[Get CMC PRICE] the base coin changed`);
                }
            }

            const Record = mongoose.model('tokens_price', tokensPriceSchema);
            const tokensPrice = new Record(record);
            await tokensPrice.save()
        }, 1000 * 60 * 5)
    }
}

export const tokensPriceSchema = new mongoose.Schema({timestamp:Number,BTC:Number,ETH:Number,BNB:Number,MATIC:Number,AVAX:Number,CRO:Number,FTM:Number,HT:Number,KAVA:Number,EVMOS:Number,FSN:Number,ELA:Number,TLOS:Number,FUSE:Number,HOO:Number,xDAI:Number,IOTX:Number});
export const tasks = new Tasks();
