const https = require('https');

const sendSubscriptionEmail = async (email) => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.EMAIL_FROM;
  if (!apiKey || !sender) {
    return { success: false, error: 'Email service is not configured' };
  }
  const body = JSON.stringify({
    sender: { name: 'SHOP.CO', email: sender },
    to: [{ email }],
    subject: 'Thanks for subscribing to SHOP.CO',
    htmlContent: '<h1>SHOP.CO</h1><p>Thank you for subscribing! You will receive updates about new arrivals and offers.</p>',
  });
  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) },
    }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode >= 200 && response.statusCode < 300
        ? { success: true }
        : { success: false, error: 'Email delivery failed' }));
    });
    request.on('error', (error) => resolve({ success: false, error: error.message }));
    request.write(body);
    request.end();
  });
};

module.exports = sendSubscriptionEmail;
