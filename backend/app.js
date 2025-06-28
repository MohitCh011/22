
const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(logger);
app.use('/', urlRoutes);

module.exports = app;
