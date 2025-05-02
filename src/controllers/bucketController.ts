import { Request, Response } from "express";
import { cleanPfp, getPfp } from "../services/bucketService";
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

async function cleanPfpsRoutine(_req: Request, res: Response) {
  await cleanPfp();

  res.sendStatus(200);
}

export { getPfpById, cleanPfpsRoutine };
