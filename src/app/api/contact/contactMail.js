import { PRIMARY_COLOR } from "../../../data/brand.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getMailHtml({ name, email, phone, project, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeProject = escapeHtml(project);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <div style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:720px;margin:0 auto;padding:36px 24px;">
        <div style="height:4px;width:100%;background:${PRIMARY_COLOR};"></div>

        <div style="padding:32px 0 22px;border-bottom:1px solid rgba(255,255,255,.14);">
          <p style="margin:0 0 12px;font-size:12px;line-height:1;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.52);">
            Portfolio Contact
          </p>
          <h1 style="margin:0;font-size:42px;line-height:.9;font-weight:900;letter-spacing:-.04em;text-transform:uppercase;">
            New Project<br />
            <span style="color:${PRIMARY_COLOR};">
              Request
            </span>
          </h1>
        </div>

        <div style="display:grid;gap:0;border-bottom:1px solid rgba(255,255,255,.14);">
          ${getMailRow("Name", safeName)}
          ${getMailRow("Email", safeEmail)}
          ${getMailRow("Phone", safePhone)}
          ${getMailRow("Project", safeProject)}
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

export function getMailText({ name, email, phone, project, message }) {
  return [
    "New portfolio contact request",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Project: ${project}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

