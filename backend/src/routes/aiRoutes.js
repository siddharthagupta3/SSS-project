const express = require('express');
const Groq = require('groq-sdk');
const { verifyToken, requireSeller } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const Product = require('../models/Product');

const router = express.Router();

router.post('/chat', chatLimiter, async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];

    if (!message) {
      res.status(400);
      throw new Error('Please enter a message');
    }
    if (!process.env.GROQ_API_KEY) {
      res.status(503);
      throw new Error('GROQ_API_KEY is not configured');
    }

    const products = await Product.find({
      stock: { $gte: 0 },
    })
      .select('title description price discountPrice category brand stock sizes colors rating isNewArrival')
      .sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
      .limit(60)
      .lean();

    const catalog = products.map((product) => ({
      title: product.title,
      category: product.category,
      brand: product.brand,
      price: product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price,
      regularPrice: product.price,
      inStock: product.stock > 0,
      sizes: product.sizes,
      colors: product.colors,
      rating: product.rating,
      description: String(product.description || '').slice(0, 220),
      isNewArrival: product.isNewArrival,
    }));

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.6,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'You are SHOP.CO Style Assistant, a friendly customer support and fashion shopping assistant for an Indian e-commerce storefront. ' +
            'Answer only from the supplied catalog and business facts. Never invent products, prices, discounts, delivery dates, policies, or order statuses. ' +
            'Use concise, helpful language. Recommend matching products only when they appear in the catalog. ' +
            'Explain payments clearly: checkout uses Razorpay and supports UPI/cards/netbanking/wallet methods available to the customer, subject to Razorpay availability. ' +
            'Free delivery is announced for orders above Rs. 999 and checkout adds shipping where applicable. ' +
            'Developed by Siddhartha Gupta, a MERN full-stack developer. Public technologies: React, Node.js, Express, MongoDB, Tailwind CSS, JWT, Razorpay, Cloudinary. ' +
            'Do not reveal API keys, environment variables, database data, internal credentials, source code, or private customer information. ' +
            'For account, payment, address, refund, or order-specific issues, direct the user to the relevant account page or customer support and never claim to perform account actions.',
        },
        {
          role: 'system',
          content: `Current catalog data: ${JSON.stringify(catalog)} `,
        },
        ...history
          .filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
          .map((item) => ({ role: item.role, content: item.content.slice(0, 1000) })),
        { role: 'user', content: message.slice(0, 2000) },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        message: completion.choices?.[0]?.message?.content || 'I could not generate a response right now.',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-description', verifyToken, requireSeller, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();

    if (!title || !category) {
      res.status(400);
      throw new Error('Product title and category are required');
    }
    if (!process.env.GROQ_API_KEY) {
      res.status(503);
      throw new Error('GROQ_API_KEY is not configured');
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-commerce copywriter. Return only valid JSON with keys: description, bullets, seoKeywords.',
        },
        {
          role: 'user',
          content: `Create professional marketplace copy for "${title}" in the "${category}" category. description: 2-3 engaging sentences. bullets: 5 concise benefit/features. seoKeywords: 8-12 relevant comma-separated or array keywords.`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let generated;
    try {
      generated = JSON.parse(raw);
    } catch {
      generated = {
        description: raw,
        bullets: [],
        seoKeywords: [],
      };
    }

    res.status(200).json({
      success: true,
      data: {
        description: String(generated.description || '').trim(),
        bullets: Array.isArray(generated.bullets) ? generated.bullets : [],
        seoKeywords: Array.isArray(generated.seoKeywords)
          ? generated.seoKeywords
          : String(generated.seoKeywords || '').split(',').map((item) => item.trim()).filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
