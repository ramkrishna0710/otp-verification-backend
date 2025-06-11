import express from 'express'
import { Register, ResendOtp, VerifyEmail, } from '../controllers/Auth.js'

const AuthRoutes = express.Router()

AuthRoutes.post('/register', Register)
AuthRoutes.post('/verifyEmail', VerifyEmail)
AuthRoutes.post('/resendOtp', ResendOtp)
export default AuthRoutes