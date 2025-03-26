import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as nodemailer.TransportOptions);

export const sendVerificationCode = async (
  email: string,
  code: string,
  firstName: string,
) => {
  try {
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);

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
      from: `"Verification, CentarNIT Academy" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verification Code",
      html: `
      <p>Dear ${formattedFirstName},</p>
      <p>Thank you for registering with us!</p>
      <p>Please use the following verification code to complete your registration process:</p>
      <p><strong>Verification Code: ${code}</strong></p>
      <p>This code is valid for the next 5 minutes. If you did not request this verification code, please ignore this email.</p>
      <p>If you encounter any issues or need further assistance, feel free to contact us.</p>
      <p>Best regards,</p>
      <p>The CentarNit Academy Team</p>
      `,
    });

    return { message: "Code sent successfully!" };
  } catch (error) {
    throw new Error("Failed to send verification code. Please try again.");
  }
};
