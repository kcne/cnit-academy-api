import { Router } from "express";
import { getUsers } from "../controllers/userController";
import { verifyEmail, resendEmail } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/verify-email", verifyEmail);
router.post("/resend-email", resendEmail);

export default router;
