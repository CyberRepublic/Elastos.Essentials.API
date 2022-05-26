import logger from "../../logger";
import { DataOrError, dataOrErrorData, serverError } from "../../model/dataorerror";
import { IMultiSigTransaction, MultiSigTransaction } from "./multisigtx";

/**
 * Service used to store and retrieved partly signed multi-signature wallet transactions.
 * This allows to conveniently share transactions among co-signers.
 */
class MultiSigService {
  public init() {
    console.log("MultiSig service setup");
  }

  public async getTransactionBykey(key: string): Promise<DataOrError<IMultiSigTransaction>> {
    try {
      let tx = await MultiSigTransaction.findOne({
        transactionKey: key
      });

      return dataOrErrorData(tx);
    }
    catch (e) {
      logger.error("Multisig getTransactionBykey() error:", e);
      return serverError("Failed to get transaction by key");
    }
  }

  public async upsertTransaction(key: string, rawTx: any, network: string): Promise<DataOrError<void>> {
    logger.log("Upserting transaction:", key, rawTx);

    try {
      let tx = await MultiSigTransaction.findOne({
        transactionKey: key
      });

      if (!tx) {
        tx = new MultiSigTransaction();
        tx.transactionKey = key;
        tx.network = network;
      }

      tx.rawTransaction = rawTx;
      await tx.save();

      return dataOrErrorData();
    }
    catch (e) {
      logger.error("Multisig upsertTransaction() error:", e);
      return serverError("Failed to upsert transaction");
    }
  }

  public async deleteTransaction(key: string): Promise<DataOrError<void>> {
    try {
      await MultiSigTransaction.deleteOne({
        transactionKey: key
      });

      return dataOrErrorData();
    }
    catch (e) {
      logger.error("Multisig getTransactionBykey() error:", e);
      return serverError("Failed to get transaction by key");
    }
  }
}

export const multiSigService = new MultiSigService();