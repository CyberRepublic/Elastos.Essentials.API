import mongoose from "mongoose";
import { SecretConfig } from "../config/env-secret";

class DBService {
    public async init(): Promise<void> {
        let mongoConnectionUrl;
        if (SecretConfig.Mongo.user)
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.user}:${SecretConfig.Mongo.password}@${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}?authSource=admin`;
        else
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}`;

        await mongoose.connect(mongoConnectionUrl);
    }
}

export const dbService = new DBService();
