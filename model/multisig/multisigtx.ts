import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export interface IMultiSigTransaction extends mongoose.Document {
  _id: ObjectId;
  transactionKey: string;
  rawTransaction: any;
  network: string;
}

const schema = new mongoose.Schema({
  transactionKey: { type: String, required: true },
  rawTransaction: { type: Object, required: true },
  network: { type: String, required: true }
});

export const MultiSigTransaction = mongoose.model<IMultiSigTransaction>('MultiSigTransaction', schema);
