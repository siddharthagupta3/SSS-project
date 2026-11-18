const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/newsletterController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/subscribe', authLimiter, subscribe);

module.exports = router;
