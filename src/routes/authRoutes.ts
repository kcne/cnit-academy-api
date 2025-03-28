import { Request, Response, Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendEmail,
} from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-email", resendEmail);
router.post("/login", login);
router.post("/protected", authMiddleware, (_req: Request, res: Response) => {
  res.json("great");
});

export default router;
