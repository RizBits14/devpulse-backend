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

const loginUser = (req: Request, res: Response) => {
    res.send('Login controller is working')
}

export const authController = { signupUser, loginUser }