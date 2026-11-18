const nodemailer = require('nodemailer');

const sendSubscriptionEmail = async (email) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return { success: false, error: 'Email service is not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"SHOP.CO" <${emailUser}>`,
      to: email,
      subject: 'Thanks for subscribing to SHOP.CO',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;border:1px solid #e5e5e5;border-radius:18px">
          <h1 style="margin:0;font-size:28px;letter-spacing:-1px;color:#111">SHOP.CO</h1>
          <p style="margin-top:24px;font-size:15px;color:#333">Thank you for subscribing!</p>
          <p style="font-size:14px;line-height:1.7;color:#555">
            You will now receive updates about new arrivals, exclusive offers and the latest SHOP.CO collections.
          </p>
          <div style="margin-top:24px;padding:14px;border-radius:12px;background:#111;color:#fff;text-align:center;font-weight:700">
            Welcome to SHOP.CO
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = sendSubscriptionEmail;
