const express = require('express');
const Groq = require('groq-sdk');
const { verifyToken, requireSeller } = require('../middleware/authMiddleware');

const router = express.Router();

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
