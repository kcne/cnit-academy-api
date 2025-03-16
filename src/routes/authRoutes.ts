import { Request, Response, Router } from "express";
import { register, login } from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import { verifyEmail, resendEmail } from "../controllers/emailController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verifyEmail", verifyEmail);
router.post("/resendEmail", resendEmail);
router.post("/protected", authMiddleware, (req: Request, res: Response) => {
  res.json("great");
});

export default router;
