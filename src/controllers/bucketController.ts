import { Request, Response } from "express";
import { getPfp } from "../services/bucketService";
import { z } from "zod";

async function getPfpById(req: Request, res: Response) {
  const id = await z
    .string()
    .max(64)
    .refine(
      (str) => str.match(/^([\d\w]+\.)(png|webp|jpg|jpeg)$/),
      "Pfp id is invalid",
    )
    .parseAsync(req.params.id);

  const { byteArray, contentType } = await getPfp(id);

  if (contentType) {
    res.contentType(contentType);
  }
  res.write(byteArray);
  res.end();
}

export { getPfpById };
