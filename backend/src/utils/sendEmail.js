const https = require('https');

const postBrevo = ({ apiKey, sender, email, name, otp, subject, purpose }) =>
  new Promise((resolve) => {
    const body = JSON.stringify({
      sender: { name: 'SHOP.CO', email: sender },
      to: [{ email, name: name || 'Customer' }],
      subject,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e5e5;border-radius:16px">
          <h1 style="text-align:center;margin:0">SHOP.CO</h1>
          <p>Hi ${name || 'Customer'},</p>
          <p>Use this 6-digit code to ${purpose === 'reset' ? 'reset your password' : 'verify your email'}:</p>
          <div style="text-align:center;margin:28px 0">
            <span style="background:#000;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;padding:14px 28px;border-radius:12px">${otp}</span>
          </div>
          <p style="font-size:12px;color:#777;text-align:center">This code expires in 5 minutes. If you did not request it, ignore this email.</p>
        </div>`,
    });

    const request = https.request({
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ success: true });
        } else {
          console.warn(`Brevo email failed (${response.statusCode})`);
          resolve({ success: false, error: 'Brevo email delivery failed' });
        }
      });
    });
    request.on('error', (error) => {
      console.warn('Brevo email failed:', error.message);
      resolve({ success: false, error: error.message });
    });
    request.write(body);
    request.end();
  });

const sendEmailOTP = async ({ email, name, otp, purpose = 'register' }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.EMAIL_FROM;
  if (!apiKey || !sender) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] ${email}: ${otp} (${purpose})`);
    } else {
      console.warn('Brevo email not configured: BREVO_API_KEY or EMAIL_FROM is missing');
    }
    return { success: false, error: 'Email provider is not configured' };
  }
  return postBrevo({
    apiKey,
    sender,
    email,
    name,
    otp,
    purpose,
    subject: `${otp} is your SHOP.CO ${purpose === 'reset' ? 'password reset' : 'verification'} code`,
  });
};

module.exports = sendEmailOTP;
