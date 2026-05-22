import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import type { UserRole } from "../modules/auth/auth.interface";

type DecodedUser = JwtPayload & {
    id: number
    name: string
    role: UserRole
}

const isDecodedUser = (decoded: string | JwtPayload): decoded is DecodedUser => {
    return (
        typeof decoded !== 'string' &&
        typeof decoded.id === 'number' &&
        typeof decoded.name === 'string' &&
        (decoded.role === 'contributor' || decoded.role === 'maintainer')
    )
}

const auth = (requiredRoles?: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const token = req.headers.authorization

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized access',
                errors: 'JWT token is missing'
            })
            return
        }

        const jwtSecret = config.jwt_secret

        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                errors: 'JWT_SECRET is missing'
            })
            return
        }

        try {
            const decoded = jwt.verify(token, jwtSecret)

            if (!isDecodedUser(decoded)) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized access',
                    errors: 'Invalid token payload'
                })
                return
            }

            if (requiredRoles && !requiredRoles.includes(decoded.role)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden access',
                    errors: 'You do not have permission to perform this action'
                })
                return
            }

            req.user = {
                id: decoded.id,
                name: decoded.name,
                role: decoded.role
            }

            next()
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized access',
                errors: 'Invalid or expired token'
            })
        }
    }
}

export default auth;