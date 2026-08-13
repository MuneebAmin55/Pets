import { Router } from "express";
import { register, login, googleLogin, forgotPassword, verifyOtp, resetPassword } from "../controller/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/password-reset", forgotPassword);
router.post("/password-reset/verify", verifyOtp);
router.post("/password-reset/complete", resetPassword);

export default router;
