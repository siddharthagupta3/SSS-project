const nodemailer = require('nodemailer');

/**
 * Send Email OTP verification
 * Supports real Gmail SMTP transport or dev console logging
 */
const sendEmailOTP = async ({ email, name, otp }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  console.log('\n==================================================');
  console.log(`📧 [GMAIL OTP DISPATCHED] To: ${email}`);
  console.log(`🔐 Verification Code (OTP): [ ${otp} ]`);
  console.log('Valid for 10 minutes.');
  console.log('==================================================\n');

  // If credentials are configured in .env, attempt sending live email via Gmail SMTP
  if (emailUser && emailPass && !emailUser.includes('placeholder')) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"SHOP.CO Security" <${emailUser}>`,
        to: email,
        subject: `${otp} is your SHOP.CO Email Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #000;">SHOP.CO</h1>
              <p style="color: #666; font-size: 13px; margin-top: 4px;">Email Verification Code</p>
            </div>
            <p style="font-size: 15px; color: #333;">Hi ${name || 'Customer'},</p>
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Thank you for signing up with SHOP.CO. Use the 6-digit verification code below to verify your Gmail account:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; background-color: #000; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 14px 28px; border-radius: 12px; font-family: monospace;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 12px; color: #888; text-align: center;">
              This code will expire in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, otp };
    } catch (err) {
      console.warn('Live Gmail SMTP sending failed, OTP is printed above for testing:', err.message);
      return { success: false, fallbackOtp: otp, error: err.message };
    }
  }

  return { success: true, fallbackOtp: otp };
};

module.exports = sendEmailOTP;
