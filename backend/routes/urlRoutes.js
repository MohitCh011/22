
const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');
const generateShortcode = require('../utils/generateCode');

router.post('/shorturls', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  let code = shortcode || generateShortcode();
  if (!/^[a-zA-Z0-9]{3,10}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid shortcode format' });
  }
  const exists = await ShortUrl.findOne({ shortcode: code });
  if (exists) return res.status(409).json({ error: 'Shortcode already in use' });
  const expiry = new Date(Date.now() + validity * 60000);
  const shortUrl = new ShortUrl({ originalUrl: url, shortcode: code, expiresAt: expiry });
  await shortUrl.save();
  res.status(201).json({
    shortLink: `http://localhost:3000/${code}`,
    expiry: expiry.toISOString()
  });
});

router.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const urlDoc = await ShortUrl.findOne({ shortcode });
  if (!urlDoc) return res.status(404).json({ error: 'Shortcode not found' });
  res.json({
    originalUrl: urlDoc.originalUrl,
    createdAt: urlDoc.createdAt,
    expiry: urlDoc.expiresAt,
    clickCount: urlDoc.clickCount,
    clicks: urlDoc.clicks
  });
});

router.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const urlDoc = await ShortUrl.findOne({ shortcode });

  if (!urlDoc) return res.status(404).json({ error: 'Shortcode not found' });

  if (new Date() > urlDoc.expiresAt) return res.status(410).json({ error: 'Link expired' });

  urlDoc.clickCount += 1;
  urlDoc.clicks.push({
    timestamp: new Date(),
    referrer: req.get('Referrer') || 'Direct',
    location: req.ip
  });
  await urlDoc.save();

  res.redirect(urlDoc.originalUrl);
});

module.exports = router;
