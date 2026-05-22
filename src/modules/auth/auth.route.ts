import { Router } from "express";

const router = Router()

router.post('/signup', (req, res) => {
    res.send('Singup route is working')
})

router.post('/login', (req, res) => {
    res.send('Login route is working')
})

export const authRoutes = router