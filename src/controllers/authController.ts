import { Request, Response } from "express";
import { getUser, createUser } from "../services/authService";
import { resendVerificationCode, verifyCode } from "../services/emailService";

async function register(req: Request, res: Response) {
  const user = await createUser(req.body);
  res.status(201).json(user);
}

async function login(req: Request, res: Response) {
  const result = await getUser(req.body);

  res.json(result);
}

async function verifyEmail(req: Request, res: Response) {
  const { code, email } = req.body;

  await verifyCode(code, email);
  res.json({ message: "Email successfully is verified" });
}

async function resendEmail(req: Request, res: Response) {
  const { email } = req.body;

  await resendVerificationCode(email);
  res.json({ message: "New code sent!" });
}

export { verifyEmail, resendEmail, register, login };
