import type { Request, Response } from "express";
import sendErrorResponse from "../../utils/sendErrorResponse";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";

const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body || {}

        if (!name || !email || !password) {
            sendErrorResponse(res, 400, 'Name, email and password are required')
            return
        }

        if (role && role !== 'contributor' && role !== 'maintainer') {
            sendErrorResponse(res, 400, 'Role must be contributor or maintainer')
            return
        }

        const payload =
            role !== undefined
                ? { name, email, password, role }
                : { name, email, password }

        const user = await authService.createUserIntoDB(payload)

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully',
            data: user,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            400,
            'User registration failed',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body || {}

        if (!email || !password) {
            sendErrorResponse(res, 400, 'Email and password are required')
            return
        }

        const result = await authService.loginUserFromDB({
            email,
            password,
        })

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Login successful',
            data: result,
        })
    } catch (error) {
        sendErrorResponse(
            res,
            401,
            'Login failed',
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

export const authController = { signupUser, loginUser }