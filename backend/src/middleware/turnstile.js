/**
 * Cloudflare Turnstile CAPTCHA Verification Middleware
 * Get your keys from: https://dash.cloudflare.com → Turnstile
 */

const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';

const verifyTurnstile = async (req, res, next) => {
  // Skip CAPTCHA if secret key is not configured
  if (!SECRET_KEY) return next();

  const token = req.body['cf-turnstile-response'] || req.body.turnstileToken;

  if (!token) {
    res.status(400);
    return next(new Error('CAPTCHA verification required'));
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    if (req.ip) formData.append('remoteip', req.ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      res.status(400);
      return next(new Error('CAPTCHA verification failed. Please try again.'));
    }

    next();
  } catch (err) {
    console.error('Turnstile verification error:', err.message);
    // Fail open — allow request if Cloudflare is unreachable
    next();
  }
};

module.exports = { verifyTurnstile };
