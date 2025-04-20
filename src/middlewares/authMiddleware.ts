import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface User {
  id: number;
  email: string;
  role: string;
}

function authMiddleware(requiredRole?: string[]) {
  const roles = requiredRole ?? ["USER", "INSTRUCTOR"];
  roles.push("ADMIN");

  return async function (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json({ error: "Authentication token is missing or malformed" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback secret",
      ) as User;
    } catch (error) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id, email: decoded.email, isEmailVerified: true },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    if (!roles.includes(user.role)) {
      res
        .status(403)
        .json({ error: "This route requires the " + roles + " role" });
      return;
    }

    req.user = user;
    next();
  };
}

export default authMiddleware;
