import { pool } from "../../db";
import type { SafeUser, SingupPayload } from "./auth.interface";
import bcrypt from "bcrypt"

const createUserIntoDB = async (payload: SingupPayload): Promise<SafeUser> => {
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

export const authService = { createUserIntoDB }