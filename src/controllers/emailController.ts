import { Request, Response } from "express";
import * as emailService from "../services/emailService";

async function verifyEmail(req: Request, res: Response) {
  try {
    const { code, email } = req.body;

    const result = await emailService.verifyEmail(code, email);
    res.status(200).json({ message: "Uspesno verifikovan email" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async function resendEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const result = await emailService.resendVerificationCode(email);

    res.status(200).json({ message: result.message });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export { verifyEmail, resendEmail };
