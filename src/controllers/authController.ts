import { Request, Response } from "express";
import { getUser, createUser } from "../services/authService";

async function register(req: Request, res: Response) {
  let user;
  try {
    user = await createUser(req.body);
  } catch (error) {
    console.error(error);
    res.status(500);
    if (error instanceof Error) {
      if (error.message === "User already exists with the same email") {
        res.status(409);
      }
      res.json({ error: error.message });
    }
    return;
  }

  if (!user) {
    res.status(500).json({ error: "Failed to register user" });
    return;
  }

  res.status(201).json(user);
}

async function login(req: Request, res: Response) {
  try {
    const { user, token } = await getUser(req.body);
    if (!token) {
      res.status(404).json({ error: "Wrong password or email" });
      return;
    }

    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500);
    if (error instanceof Error) {
      if (error.message === "Email is not verified") {
        res.status(401);
      }
      res.json({ error: error.message });
    }
    return;
  }
}

export { register, login };
