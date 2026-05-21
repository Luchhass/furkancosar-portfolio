import nodemailer from "nodemailer";

export const runtime = "nodejs";

const REQUIRED_FIELDS = ["name", "email", "projectType", "message"];

function cleanValue(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return cleanValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMailHtml({ name, email, projectType, timeline, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeProjectType = escapeHtml(projectType);
  const safeTimeline = escapeHtml(timeline || "Not specified");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <div style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:720px;margin:0 auto;padding:36px 24px;">
        <div style="height:4px;width:100%;background:linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67);"></div>

        <div style="padding:32px 0 22px;border-bottom:1px solid rgba(255,255,255,.14);">
          <p style="margin:0 0 12px;font-size:12px;line-height:1;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.52);">
            Portfolio Contact
          </p>
          <h1 style="margin:0;font-size:42px;line-height:.9;font-weight:900;letter-spacing:-.04em;text-transform:uppercase;">
            New Project<br />
            <span style="background:linear-gradient(90deg,#6768ff,#884cff,#cf3d9f,#ee4b67);-webkit-background-clip:text;background-clip:text;color:transparent;">
              Request
            </span>
          </h1>
        </div>

        <div style="display:grid;gap:0;border-bottom:1px solid rgba(255,255,255,.14);">
          ${getMailRow("Name", safeName)}
          ${getMailRow("Email", safeEmail)}
          ${getMailRow("Project Type", safeProjectType)}
          ${getMailRow("Timeline", safeTimeline)}
        </div>

        <div style="padding:24px 0 0;">
          <p style="margin:0 0 10px;font-size:11px;line-height:1;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.48);">
            Message
          </p>
          <div style="margin:0;padding:22px;background:#151515;border:1px solid rgba(255,255,255,.12);font-size:16px;line-height:1.45;font-weight:700;color:rgba(255,255,255,.88);">
            ${safeMessage}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMailRow(label, value) {
  return `
    <div style="display:grid;grid-template-columns:160px 1fr;gap:18px;padding:18px 0;border-top:1px solid rgba(255,255,255,.14);">
      <span style="font-size:11px;line-height:1;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.48);">${label}</span>
      <span style="font-size:16px;line-height:1.2;font-weight:800;color:#ffffff;">${value}</span>
    </div>
  `;
}

function getMailText({ name, email, projectType, timeline, message }) {
  return [
    "New portfolio contact request",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Project Type: ${projectType}`,
    `Timeline: ${timeline || "Not specified"}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

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
    const payload = {
      name: cleanValue(body.name),
      email: cleanValue(body.email),
      projectType: cleanValue(body.projectType),
      timeline: cleanValue(body.timeline),
      message: cleanValue(body.message),
    };

    const missingField = REQUIRED_FIELDS.find((field) => !payload[field]);

    if (missingField) {
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
