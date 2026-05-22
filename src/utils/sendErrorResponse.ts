import type { Response } from "express";

const sendErrorResponse = (
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown
): void => {
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== undefined && { errors })
    });
};

export default sendErrorResponse;