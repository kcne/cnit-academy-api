import prisma from "../prisma";
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationCode = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Korisnik ne postoji!");
    }

    await prisma.user.update({
      where: { email },
      data: { verificationCode: null, expiresAt: null },
    });

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationCode, expiresAt },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Kod za verifikaciju",
      text: `Vaš kod za verifikaciju je: ${verificationCode}. Važi 5 minuta.`,
    });

    console.log("Email poslat!", email);

    return { message: "Kod je poslat!" };
  } catch (error) {
    console.error("Greška pri slanju emaila:", error);
    throw new Error("Došlo je do greške, pokušajte ponovo.");
  }
};

export const verifyEmail = async (code: string, email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Korisnik nije pronađen");
    }

    if (
      user.verificationCode === code &&
      user.expiresAt &&
      user.expiresAt > new Date()
    ) {
      await prisma.user.update({
        where: { email },
        data: {
          isEmailVerified: true,
        },
      });

      console.log("Email je uspešno verifikovan.");
      return { message: "Email je uspešno verifikovan." };
    } else {
      throw new Error("Neispravan ili istekao verifikacioni kod.");
    }
  } catch (error) {
    console.error("Greška pri verifikaciji emaila:", error);
    throw new Error("Došlo je do greške, pokušajte ponovo.");
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Korisnik ne postoji!");
    }

    if (user.isEmailVerified) {
      throw new Error("Email je već verifikovan.");
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Novi kod važi 5 minuta

    await prisma.user.update({
      where: { email },
      data: { verificationCode, expiresAt },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Ponovni kod za verifikaciju",
      text: `Vaš novi kod za verifikaciju je: ${verificationCode}. Važi 5 minuta.`,
    });

    console.log("Ponovni email poslat!", email);

    return { message: "Novi kod je poslat!" };
  } catch (error) {
    console.error("Greška pri slanju ponovnog emaila:", error);
    throw new Error("Došlo je do greške, pokušajte ponovo.");
  }
};
