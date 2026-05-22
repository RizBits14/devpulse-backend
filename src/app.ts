import express, { type Request, type Response } from "express";
import { authRoutes } from "./modules/auth/auth.route";

const app = express()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the server")
});

app.use('/api/auth', authRoutes)

export default app