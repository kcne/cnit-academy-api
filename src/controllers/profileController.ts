import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Request, Response } from "express";
import {
  getProfiles,
  getProfile,
  changeProfile,
  removeProfile,
} from "../services/profileService";
import { z } from "zod";
import formidable, { Files } from "formidable";
import { PassThrough } from "stream";
import { putPfp } from "../services/bucketService";
import { hash } from "crypto";
import createHttpError from "http-errors";
import assert from "assert";

async function getAllProfiles(req: Request, res: Response) {
  const { page, limit } = req.query;

  const profiles = await getProfiles({
    page: Number(page ?? 1),
    limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
  });

  res.json(profiles);
}

async function getProfileById(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const id =
    req.params.id === "me"
      ? req.user.id
      : await z.coerce.number().positive().int().parseAsync(req.params.id);

  const profile = await getProfile(id);

  res.json(profile);
}

async function updateProfile(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const id =
    (await z.coerce
      .number()
      .positive()
      .int()
      .optional()
      .parseAsync(req.params.id)) ?? req.user.id;

  const profile = await changeProfile(id, req.body);

  res.json(profile);
}

async function updateProfilePhoto(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const id =
    (await z.coerce
      .number()
      .positive()
      .int()
      .optional()
      .parseAsync(req.params.id)) ?? req.user.id;

  let successfulUpload = false;
  const form = formidable({
    filter({ mimetype }) {
      return ["image/png", "image/webp", "image/jpeg"].includes(mimetype ?? "");
    },
    fileWriteStreamHandler: function (file: any) {
      const pass = new PassThrough();

      if (!file.hasOwnProperty("newFilename")) {
        return pass;
      }

      try {
        putPfp(file.newFilename, pass);
        successfulUpload = true;
      } catch (err) {
        console.error(err);
      }

      return pass;
    },
    filename(name, _ext, part) {
      const { originalFilename } = part;

      const fileExtension = originalFilename?.match(/\.[\d\w]+$/) ?? "";
      const filename = hash("md5", name + Date.now()) + fileExtension;

      return filename;
    },
  });
  const [_, files]: [unknown, Files<string>] = await form.parse(req);

  if (!successfulUpload) {
    throw createHttpError(400, "Photo upload failed");
  }

  const data: any = {
    pfp: process.env.BASE_URL + "/files/pfp/" + files.pfp?.at(0)?.newFilename,
  };

  const user = await changeProfile(id, data);
  res.status(200).json(user);
}

async function deleteProfile(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const id =
    (await z.coerce
      .number()
      .positive()
      .int()
      .optional()
      .parseAsync(req.params.id)) ?? req.user.id;

  await removeProfile(id);

  res.send();
}

export {
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  updateProfilePhoto,
};
