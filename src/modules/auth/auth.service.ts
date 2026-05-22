import { config } from "../../config";
import { pool } from "../../db";
import type { LoginPayload, SafeUser, SignupPayload, UserWithPassword } from "./auth.interface";
import bcrypt from "bcrypt"
import jwt, { type SignOptions } from "jsonwebtoken";

const createUserIntoDB = async (payload: SignupPayload): Promise<SafeUser> => {
    const { name, email, password, role = 'contributor' } = payload

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query<SafeUser>(`
        INSERT INTO users (name, email, password, role) VALUES ( $1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashedPassword, role])

    const user = result.rows[0]

    if (!user) {
        throw new Error('User registration failed')
    }
    return user
}

const loginUserFromDB = async (playload: LoginPayload) => {
    const { email, password } = playload
    const result = await pool.query(`
        SELECT id, name, email, password, role, created_at, updated_at 
        FROM users 
        WHERE email = $1
        `, [email])

    const user = result.rows[0]

    if (!user) {
        throw new Error('Invalid email or password')
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        throw new Error('Invalid email or password')
    }

    const jwtSecret = config.jwt_secret
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is missing')
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }

    const jwtOptions: SignOptions = {
        expiresIn: config.jwt_expires
    }
    const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

    const safeUser: SafeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
    }

    return { token, user: safeUser }

}

export const authService = { createUserIntoDB, loginUserFromDB }