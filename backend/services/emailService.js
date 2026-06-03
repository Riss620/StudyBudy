/**
 * Email service - sends OTP emails using nodemailer
 * Improved: validates env vars, provides clear logging and error handling
 */
const nodemailer = require('nodemailer');

// Build transporter options from environment variables.
// Supports a custom SMTP URL or Gmail via user/pass.
const buildTransportOptions = () => {
  if (process.env.SMTP_URL) {
    // If user provided a full SMTP URL (e.g., smtp://user:pass@smtp.example.com:587)
    return process.env.SMTP_URL;
  }

  // Fallback to auth-based transporter (e.g., Gmail)
  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    }
  };
};

const transporterOptions = buildTransportOptions();

let transporter;
try {
  transporter = nodemailer.createTransport(transporterOptions);
} catch (err) {
  // Creating transporter shouldn't crash the entire server; log and set transporter to null
  console.error('Failed to create email transporter:', err && err.message ? err.message : err);
  transporter = null;
}

// Helper to check minimal email config validity
const emailConfigValid = () => {
  if (process.env.SMTP_URL) return true;
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

// Send OTP email
const sendOtpEmail = async (email, otp) => {
  if (!transporter) {
    const msg = 'Email transporter not configured or failed to initialize';
    console.error(msg);
    const error = new Error(msg);
    error.code = 'EMAIL_TRANSPORTER_NOT_CONFIGURED';
    throw error;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@discussion-platform.local',
    to: email,
    subject: 'Your OTP for Account Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Verification Code</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hello,</p>
          <p style="color: #666; font-size: 16px; margin-bottom: 30px;">You requested to change your password or delete your account. Please use the following OTP to verify your identity:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; border: 2px dashed #667eea;">
            <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0;">${otp}</p>
          </div>
          <p style="color: #e74c3c; font-size: 14px; margin-bottom: 20px; text-align: center;">⚠️ This OTP expires in 5 minutes. Do not share it with anyone.</p>
          <p style="color: #666; font-size: 14px; margin: 10px 0;">If you didn't request this, please ignore this email.</p>
          <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; color: #999; font-size: 12px; text-align: center;"><p>© Discussion Platform. All rights reserved.</p></div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent to %s: %s', email, info && info.response ? info.response : info.messageId || 'sent');
    return { success: true, info };
  } catch (error) {
    console.error('Error sending OTP email to %s:', email, error && error.message ? error.message : error);
    // Attach a code for higher-level handling
    error.code = error.code || 'EMAIL_SEND_FAILED';
    throw error;
  }
};

// Optional helper to verify transporter connectivity (can be called from startup)
const verifyTransporter = async () => {
  if (!transporter) return { ok: false, reason: 'transporter_not_configured' };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    console.error('Email transporter verification failed:', err && err.message ? err.message : err);
    return { ok: false, reason: err && err.message ? err.message : String(err) };
  }
};

module.exports = { sendOtpEmail, verifyTransporter, emailConfigValid };
