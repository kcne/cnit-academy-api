import { Request, Response } from "express";
import { getUser, createUser } from "../services/authService";
import { resendVerificationCode, verifyCode } from "../services/emailService";
import formidable, { Fields, Files } from "formidable";
import { PassThrough } from "node:stream";
import { hash } from "node:crypto";
import { putPfp } from "../services/bucketService";

async function register(req: Request, res: Response) {
  const user = await createUser(req.body);
  res.status(201).json(user);
}

async function registerForm(req: Request, res: Response) {
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
  const [fields, files]: [Fields<string>, Files<string>] =
    await form.parse(req);

  // validation is done in createUser() so using any is fine
  const newUser: any = {
    firstName: fields.firstName?.at(0),
    lastName: fields.lastName?.at(0),
    email: fields.email?.at(0),
    password: fields.password?.at(0),
    pfp: successfulUpload
      ? "/pfp/" + files.pfp?.at(0)?.newFilename
      : "/pfp/default.png",
  };
  console.log(files.pfp?.at(0)?.newFilename);

  const user = await createUser(newUser);
  res.status(201).json(user);
}

async function login(req: Request, res: Response) {
  const result = await getUser(req.body);

  res.json(result);
}

async function verifyEmail(req: Request, res: Response) {
  const { code, email } = req.body;

  await verifyCode(code, email);
  res.json({ message: "Email successfully is verified" });
}

async function resendEmail(req: Request, res: Response) {
  const { email } = req.body;

  await resendVerificationCode(email);
  res.json({ message: "New code sent!" });
}

export { verifyEmail, resendEmail, register, registerForm, login };
