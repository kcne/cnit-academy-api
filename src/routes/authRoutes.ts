import { Request, Response, Router } from "express";
import {
  register,
  registerForm,
  login,
  verifyEmail,
  resendEmail,
  google,
} from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/register-form", asyncHandler(registerForm));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/resend-email", asyncHandler(resendEmail));
router.post("/login", asyncHandler(login));
router.post("/google", asyncHandler(google));

router.post("/protected", authMiddleware(), (_req: Request, res: Response) => {
  res.json("great");
});
router.post(
  "/admin",
  authMiddleware(["ADMIN"]),
  (_req: Request, res: Response) => {
    res.json("great");
  },
);

export default router;
