import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>

export const config = {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires: (process.env.JWT_EXPIRES_IN || "7d") as JwtExpiresIn
};