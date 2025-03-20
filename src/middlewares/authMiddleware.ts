import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ error: "Authentication token is missing or invalid" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback secret",
    ) as {
      id: number;
      email: string;
    };
    if (
      !prisma.user.findUnique({
        where: { id: decoded.id, isEmailVerified: true },
      })
    ) {
      res.status(403).json({ error: "Email is not verified" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
