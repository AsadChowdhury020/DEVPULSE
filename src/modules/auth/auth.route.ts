import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post('/access_token', authController.loginUser)
router.post('/refresh_token', authController.generateRefreshToken)

export const authRoute = router