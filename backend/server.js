const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
});

// Apply to all API routes
app.use('/api/', apiLimiter);
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Helpdesk backend running on port ${PORT}`));