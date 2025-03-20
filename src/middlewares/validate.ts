import { Request, Response } from "express";
import zodSchema from "zod";

const validate =
  (schema: zodSchema) =>
  (req: Request, res: Response) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error,
      });
    }
  };

export default validate;