import nodemailer from "nodemailer";
import { readContactFields } from "@/lib/contactFields";
import { getMailHtml, getMailText } from "./contactMail";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return Response.json(
        { message: "Email service is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const payload = readContactFields(field => body?.[field]);

    if (Object.values(payload).some(value => !value)) {
      return Response.json(
        { message: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return Response.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const phoneDigits = payload.phone.replace(/\D/g, "");
    if (!/^[+\d\s().-]+$/.test(payload.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      return Response.json(
        { message: "Please enter a valid phone number." },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s/g, ""),
      },
    });

    await transporter.sendMail({
      from: `"Furkancosar Portfolio" <${emailUser}>`,
      to: emailUser,
      replyTo: payload.email,
      subject: `New project request from ${payload.name}`,
      text: getMailText(payload),
      html: getMailHtml(payload),
    });

    return Response.json({
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact email error:", error);

    return Response.json(
      { message: "Message could not be sent. Please try again later." },
      { status: 500 },
    );
  }
}
