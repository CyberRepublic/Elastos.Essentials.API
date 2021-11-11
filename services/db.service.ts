import { MongoClient } from "mongodb";
import { SecretConfig } from "../config/env-secret";

class DBService {
    private client: MongoClient;

    constructor() {
        let mongoConnectionUrl;
        if (SecretConfig.Mongo.user)
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.user}:${SecretConfig.Mongo.password}@${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}?authSource=admin`;
        else
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}`;

        console.log("mongoConnectionUrl", mongoConnectionUrl);

        this.client = new MongoClient(mongoConnectionUrl, {
            //useNewUrlParser: true, useUnifiedTopology: true
        });
    }

    public getMongoClient(): MongoClient {
        return this.client;
    }
}

export const dbService = new DBService();
