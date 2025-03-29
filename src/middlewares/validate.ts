import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

