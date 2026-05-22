import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            })
            return
        }
        if (role && role !== 'contributor' && role !== 'maintainer') {
            res.status(400).json({
                success: false,
                message: "Role must be contributor or maintainer"
            })
            return
        }
        const user = await authService.createUserIntoDB(
            { name, email, password, role }
        )
        res.status(201).json({
            success: true,
            message: 'User registration has been done successfully',
            data: user
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'User registration has been failed',
            errors: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
            return
        }

        const result = await authService.loginUserFromDB({
            email, password
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Login failed',
            errors: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const authController = { signupUser, loginUser }