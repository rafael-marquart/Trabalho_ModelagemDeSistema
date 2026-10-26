import nodemailer from "nodemailer";

export async function sendEmail(input: { to: string; subject: string; text: string }) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) throw new Error("SMTP_NOT_CONFIGURED");

  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const transporter = nodemailer.createTransport({
    host, port, secure,
    ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || "" } } : {})
  });
  await transporter.sendMail({ from, to: input.to, subject: input.subject, text: input.text });
}