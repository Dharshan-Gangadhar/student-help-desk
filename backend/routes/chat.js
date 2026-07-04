const express = require('express');
const { queryHelpdesk } = require('../services/ragService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const answer = await queryHelpdesk(query);
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate answer' });
    }
});

module.exports = router;