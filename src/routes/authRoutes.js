import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyRecivedLink,
  getEmailVerificationLink,
  requestResetPasswordLink,
  changePassword
} from "../controllers/authController.js";

const router = Router();

router.post("/login",loginUser)
router.post("/register",registerUser)
router.post("/get-verification-email", getEmailVerificationLink)
router.get("/verify/:token", verifyRecivedLink)
router.post("/get-reset-password-link", requestResetPasswordLink)
router.post("/reset-password/:token", changePassword)

export default router;