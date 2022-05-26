import { Response } from "express";
import logger from "../logger";
import { DataOrError, ErrorType } from "../model/dataorerror";

const errorTypeToHttpStatus = (dataOrError: DataOrError<unknown>) => {
  switch (dataOrError.errorType) {
    case ErrorType.STATE_ERROR: return 400;
    case ErrorType.FORBIDDEN_ACCESS: return 401;
    case ErrorType.INVALID_PARAMETER: return 403;
    case ErrorType.SERVER_ERROR: return 500;
    default: return 500;
  }
}

export const apiError = (res: Response, dataOrError: DataOrError<unknown>) => {
  logger.error("API Error", dataOrError.error);
  res.status(errorTypeToHttpStatus(dataOrError)).send(dataOrError.error);
}