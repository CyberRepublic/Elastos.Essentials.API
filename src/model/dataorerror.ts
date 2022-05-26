import logger from "../logger";

export enum ErrorType {
    STATE_ERROR, // 400
    FORBIDDEN_ACCESS, // 401
    INVALID_PARAMETER, // 403
    SERVER_ERROR // 500
}

export type DataOrError<T> = {
    error?: string, // If there is an error, the error message
    errorType?: ErrorType; // Hint to assess the http error code to return
    data?: T;
}

export const error = <T>(errorType: ErrorType, error: string): DataOrError<T> => {
    return {
        error, errorType
    }
};

export const accessForbiddenError = <T>(message: string): DataOrError<T> => {
    return error(ErrorType.FORBIDDEN_ACCESS, message);
};

export const invalidParamError = <T>(message: string, e?: any): DataOrError<T> => {
    if (e)
        logger.warn(e);

    return error(ErrorType.INVALID_PARAMETER, message);
};

export const serverError = <T>(message: string): DataOrError<T> => {
    return error(ErrorType.SERVER_ERROR, message);
};

export const logAndThrowError = (message: string) => {
    logger.error(message);
    throw new Error(message);
}

export const internalServerError = (err: unknown) => {
    logger.error(err);
    return {
        errorType: ErrorType.SERVER_ERROR,
        error: "Internal server error" // Note: don't return internal error details
    };
}

/**
 * Shortcut to return non-errored data
 */
export const dataOrErrorData = <T>(data?: T): DataOrError<T> => {
    return {
        data
    };
}

export const convertedError = <T>(otherError: DataOrError<unknown>): DataOrError<T> => {
    return {
        errorType: otherError.errorType,
        error: otherError.error
    };
}

export const hasError = (dataOrError: DataOrError<unknown>): boolean => {
    return !!dataOrError.error;
}