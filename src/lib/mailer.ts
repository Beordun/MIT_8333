import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(payload: MailPayload): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@miva.edu.ng";

  if (!transporter) {
    console.info(`[MivaFix Mailer - Console Fallback] To: ${payload.to} | Subject: ${payload.subject}\n${payload.text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  } catch (err) {
    console.error("Failed to send email via SMTP:", err);
  }
}

export async function sendVerificationOtpEmail(to: string, fullName: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Verify your MivaFix account (6-digit code)",
    text: `Hello ${fullName},\n\nWelcome to MivaFix! Your 6-digit email verification code is: ${otp}\n\nThis code expires in 10 minutes and can only be used once.`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#0a3452;margin-top:0;">Welcome to MivaFix, ${fullName}</h2>
      <p style="color:#334155;font-size:14px;">Please use the 6-digit verification code below to confirm your university account:</p>
      <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:8px;font-size:28px;font-weight:700;letter-spacing:6px;color:#0a3452;margin:20px 0;">${otp}</div>
      <p style="color:#64748b;font-size:12px;">This code expires in 10 minutes and cannot be reused.</p>
    </div>`,
  });
}

export async function sendPasswordResetOtpEmail(to: string, fullName: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: "MivaFix password reset code",
    text: `Hello ${fullName},\n\nYour 6-digit MivaFix password reset code is: ${otp}\n\nThis code expires in 10 minutes and can only be used once. If you did not request a reset, you can safely ignore this email.`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#0a3452;margin-top:0;">Password Reset Request</h2>
      <p style="color:#334155;font-size:14px;">Hello ${fullName}, enter the 6-digit code below to reset your MivaFix password:</p>
      <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:8px;font-size:28px;font-weight:700;letter-spacing:6px;color:#0a3452;margin:20px 0;">${otp}</div>
      <p style="color:#64748b;font-size:12px;">This code expires in 10 minutes and can only be used once.</p>
    </div>`,
  });
}

export async function sendPasswordChangedEmail(to: string, fullName: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Your MivaFix password was changed",
    text: `Hello ${fullName},\n\nYour MivaFix account password was recently changed. All previous active sessions have been signed out.`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#0a3452;margin-top:0;">Password Changed Successfully</h2>
      <p style="color:#334155;font-size:14px;">Hello ${fullName}, your MivaFix password has been updated and all older sessions have been signed out.</p>
    </div>`,
  });
}

export async function sendAccountLockedEmail(to: string, fullName: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Security alert: Your MivaFix account has been temporarily locked",
    text: `Hello ${fullName},\n\nYour MivaFix account was locked for 15 minutes after 5 failed sign-in attempts. You can wait 15 minutes or reset your password using a 6-digit OTP to unlock it immediately.`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#b91c1c;margin-top:0;">Account Temporarily Locked</h2>
      <p style="color:#334155;font-size:14px;">Hello ${fullName}, we detected 5 failed sign-in attempts on your account. For your protection, sign-in is locked for 15 minutes.</p>
      <p style="color:#334155;font-size:14px;">You can unlock your account immediately by resetting your password on the Forgot Password page.</p>
    </div>`,
  });
}

export async function sendTicketStatusEmail(
  to: string,
  fullName: string,
  ticketNumber: string,
  title: string,
  newStatus: string,
  comment: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Update on Ticket ${ticketNumber}: ${newStatus.replace("_", " ")}`,
    text: `Hello ${fullName},\n\nYour maintenance ticket ${ticketNumber} (${title}) is now marked as ${newStatus.replace("_", " ")}.\n\nNote: ${comment}`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#0a3452;margin-top:0;">Ticket ${ticketNumber} Updated</h2>
      <p style="color:#334155;font-size:14px;">Hello ${fullName}, your fault report <strong>${title}</strong> has been updated to <strong>${newStatus.replace("_", " ")}</strong>.</p>
      <p style="color:#475569;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px;">${comment}</p>
    </div>`,
  });
}

export async function sendStaffAccountCreatedEmail(
  to: string,
  fullName: string,
  role: string,
  temporaryPassword: string
): Promise<void> {
  const readableRole = role.replace("_", " ");
  await sendEmail({
    to,
    subject: `Your MivaFix ${readableRole} account is ready`,
    text: `Hello ${fullName},\n\nAn administrator has created a MivaFix ${readableRole} account for you.\n\nSign-in email: ${to}\nTemporary password: ${temporaryPassword}\n\nPlease sign in and update your password when convenient.`,
    html: `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e9ed;border-radius:12px;">
      <h2 style="color:#0a3452;margin-top:0;">Welcome to MivaFix, ${fullName}</h2>
      <p style="color:#334155;font-size:14px;">An administrator has created a <strong>${readableRole}</strong> account for you on the MivaFix Campus Maintenance Desk.</p>
      <div style="background:#f8fafc;padding:14px;border-radius:8px;font-size:13px;color:#1e293b;margin:16px 0;">
        <div><strong>Email:</strong> ${to}</div>
        <div style="margin-top:6px;"><strong>Temporary Password:</strong> ${temporaryPassword}</div>
      </div>
      <p style="color:#64748b;font-size:12px;">Your email is pre-verified so you can sign in immediately.</p>
    </div>`,
  });
}

