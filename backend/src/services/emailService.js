import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Configure Nodemailer SMTP Transporter
 * Environment variables:
 * SMTP_HOST (e.g. smtp.gmail.com or mail.yourdomain.com)
 * SMTP_PORT (e.g. 587 or 465)
 * SMTP_USER (e.g. your_email@gmail.com)
 * SMTP_PASS (e.g. your_app_password)
 * SMTP_FROM (e.g. TailorConnect <noreply@tailorconnect.com>)
 * SMTP_SECURE (true for 465, false for 587)
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Useful for local environments or development self-signed certs
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
}

let transporter = createTransporter()

/**
 * Verify SMTP Connection on demand
 */
export const verifySmtpConnection = async () => {
  if (!transporter) {
    transporter = createTransporter()
  }
  if (!transporter) {
    return {
      connected: false,
      message: 'SMTP credentials not configured. Please add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in backend/.env',
    }
  }

  try {
    await transporter.verify()
    console.log('[EmailService] SMTP server is ready to deliver real emails.')
    return { connected: true, message: 'SMTP connected successfully.' }
  } catch (err) {
    console.error('[EmailService] SMTP connection error:', err?.message)
    return { connected: false, message: err?.message }
  }
}

/**
 * Generate professional, mobile-responsive HTML Email template for OTP verification
 */
const buildOtpEmailHtml = ({ name, otp, appName = 'TailorConnect' }) => {
  const userName = name ? name.trim() : 'Valued Customer'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - ${appName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8F5EF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F2937;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8F5EF;
      padding: 40px 0;
    }
    .main {
      background-color: #FFFFFF;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      border: 1px solid #E5E1D8;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0F5C5E 0%, #164E63 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .brand-title {
      color: #FFFFFF;
      font-size: 26px;
      font-weight: 800;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .brand-title span {
      color: #C9A66B;
    }
    .content {
      padding: 36px 36px 28px;
    }
    .heading {
      font-size: 20px;
      font-weight: 700;
      color: #0F5C5E;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 14.5px;
      line-height: 1.65;
      color: #4B5563;
      margin-bottom: 20px;
    }
    .otp-card {
      background: #F0FDF4;
      border: 2px dashed #0F5C5E;
      border-radius: 14px;
      padding: 24px 20px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #0F5C5E;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
      user-select: all;
    }
    .otp-sub {
      font-size: 12.5px;
      font-weight: 600;
      color: #166534;
      margin-top: 8px;
      margin-bottom: 0;
    }
    .warning-box {
      background-color: #FEF3C7;
      border-left: 4px solid #D97706;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 13px;
      color: #92400E;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #FAFAFA;
      border-top: 1px solid #E5E7EB;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center" cellpadding="0" cellspacing="0">
      <!-- Brand Header -->
      <tr>
        <td class="header">
          <h1 class="brand-title">Tailor<span>Connect</span></h1>
          <p style="color: #DDEBE7; margin: 6px 0 0; font-size: 13px; font-weight: 500;">
            Tailoring Services & Learning Platform
          </p>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td class="content">
          <h2 class="heading">Verify Your Email Address</h2>
          <p class="paragraph">
            Hello <strong>${userName}</strong>,
          </p>
          <p class="paragraph">
            Thank you for registering on <strong>TailorConnect</strong>! To activate your account and verify your email address, please enter the following 6-digit One-Time Password (OTP):
          </p>

          <!-- OTP Box -->
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
            <p class="otp-sub">⏱️ Valid for 5 minutes only</p>
          </div>

          <!-- Security Notice -->
          <div class="warning-box">
            <strong>🔒 Security Advisory:</strong> Never share this OTP with anyone. TailorConnect representatives will never ask for your verification code. If you did not request this registration, please disregard this email.
          </div>

          <p class="paragraph" style="margin-bottom: 0;">
            Warm regards,<br>
            <strong>The TailorConnect Team</strong>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          This is an automated security verification email from TailorConnect.<br>
          Tamil Nadu, India · Customer Support: support@tailorconnect.com<br>
          © ${new Date().getFullYear()} TailorConnect. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`
}

/**
 * Send real OTP verification email using Nodemailer & SMTP
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP string
 * @param {string} name - Recipient user name
 */
export const sendVerificationOtpEmail = async (to, otp, name = '') => {
  if (!transporter) {
    transporter = createTransporter()
  }

  const from = process.env.SMTP_FROM || `"TailorConnect" <${process.env.SMTP_USER || 'noreply@tailorconnect.com'}>`

  // If no SMTP configured: in development, warn clearly; in production, throw
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[EmailService DEV] ⚠️ Real SMTP credentials not set in backend/.env. Set SMTP_USER and SMTP_PASS to deliver real emails to inboxes.`
      )
      return {
        success: true,
        simulated: true,
        messageId: `dev-simulated-${Date.now()}`
      }
    }
    const errorMsg = 'SMTP provider not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in backend/.env'
    console.error(`[EmailService] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  const mailOptions = {
    from,
    to: to.trim().toLowerCase(),
    subject: `Your TailorConnect Verification Code: ${otp}`,
    text: `Hello ${name || 'User'},\n\nYour 6-digit verification code for TailorConnect is: ${otp}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.\n\nTailorConnect Team`,
    html: buildOtpEmailHtml({ name, otp, appName: 'TailorConnect' }),
  }

  const info = await transporter.sendMail(mailOptions)
  return {
    success: true,
    messageId: info.messageId,
  }
}
