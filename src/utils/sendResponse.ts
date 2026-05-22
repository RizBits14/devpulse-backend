import type { Response } from "express";

type SendResponsePayload<T> = {
    statusCode: number
    success: boolean
    message?: string
    data?: T
};

const sendResponse = <T>(
    res: Response,
    payload: SendResponsePayload<T>): void => {

    const { statusCode, success, message, data } = payload;

    res.status(statusCode).json({
        success,
        ...(message && { message }),
        ...(data !== undefined && { data }),
    });
};

export default sendResponse;