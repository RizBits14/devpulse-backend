import type { Request, Response } from "express"

const signupUser = (req: Request, res: Response) => {
    res.send('The signup controller is working')
}

const loginUser = (req: Request, res: Response) => {
    res.send('The login controller is working')
}

export const authController = { signupUser, loginUser }