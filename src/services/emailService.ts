import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const sendVerificationCode = async (email: string, code: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Verification" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verification Code",
      text: `Your verification code: ${code}. Valid for 5 minutes.`,
    });

    console.log("Message sent: %s", info.messageId);
    return { message: "Code sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification code. Please try again.");
  }
};
