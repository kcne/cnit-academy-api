import { Request, Response } from "express";
import { getUser, createUser } from "../services/authService";
import { resendVerificationCode, verifyCode } from "../services/emailService";
import formidable, { Fields, Files } from "formidable";
import { rename } from "fs/promises";

async function register(req: Request, res: Response) {
  const user = await createUser(req.body);
  res.status(201).json(user);
}

async function registerForm(req: Request, res: Response) {
  const form = formidable({
    uploadDir: "files/pfp",
    filter: function ({ mimetype }) {
      return ["image/png", "image/webp", "image/jpeg"].includes(mimetype ?? "");
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
    pfp: "/pfp/default.png",
  };

  const file = files.pfp?.at(0);
  if (file) {
    const fileExtension = file.originalFilename?.match(/\.[\d\w]+$/) ?? "";
    await rename(file.filepath, file.filepath + fileExtension);

    newUser.pfp = "/pfp/" + file.newFilename + fileExtension;
  }

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
