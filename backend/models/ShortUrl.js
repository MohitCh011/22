
const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  timestamp: Date,
  referrer: String,
  location: String
});

const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortcode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  clicks: [ClickSchema],
  clickCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
