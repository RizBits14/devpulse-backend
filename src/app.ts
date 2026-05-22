import cors from "cors";
import express, { type Request, type Response } from "express";
import { authRoutes } from "./modules/auth/auth.route";
import { issueRoutes } from "./modules/issues/issue.route";

const app = express()

app.use(
    cors({ origin: ["http://localhost:3000"], credentials: true })
)

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to DevPulse API")
})

app.use("/api/auth", authRoutes)
app.use("/api/issues", issueRoutes)

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

export default app