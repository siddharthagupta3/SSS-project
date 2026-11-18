const Subscriber = require('../models/Subscriber');
const sendSubscriptionEmail = require('../utils/sendSubscriptionEmail');

const subscribe = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    let subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      subscriber = await Subscriber.create({ email });
    }

    const result = await sendSubscriptionEmail(email);
    if (!result.success) {
      res.status(502);
      throw new Error('Subscription saved, but the confirmation email could not be sent');
    }

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully. A confirmation email was sent.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribe };
