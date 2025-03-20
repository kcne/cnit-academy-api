import { Request, Response } from "express";
import * as userService from "../services/userService";

async function getUsers(_req: Request, res: Response) {
  const users = await userService.getAllUsers();

  res.status(200).json(users);
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const { code, email } = req.body;

    const result = await userService.verifyEmail(code, email);
    res.status(200).json({ message: "Successfully e-mail is verified" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async function resendEmail(req: Request, res: Response) {
  try {
    const { email, firstName } = req.body;

    const result = await userService.resendVerificationCode(email, firstName);

    res.status(200).json({ message: "New code sent!" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export { getUsers, verifyEmail, resendEmail };
