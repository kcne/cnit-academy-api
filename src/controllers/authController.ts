import { Request, Response } from "express";
import { getUser, createUser } from "../services/authService";

async function register(req: Request, res: Response) {
  const user = await createUser(req.body);

  if (!user) {
    res.status(500).json({ error: "Failed to register user." });
  }

  res.status(201).json(user);
}

async function login(req: Request, res: Response) {
  const { user, token } = await getUser(req.body);

  if (!user) {
    res.status(404).json({ error: "Wrong password or email." });
  }

  res.status(200).json({ user, token });
}

export { register, login };
