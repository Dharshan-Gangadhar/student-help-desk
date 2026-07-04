const express = require('express');
const multer = require('multer');
const PDFParser = require('pdf2json');
const { storeDocumentChunks } = require('../services/ragService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        let rawText = "";

        // 🚀 FAST-TRACK: If it's a text file
        if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
            rawText = req.file.buffer.toString('utf-8');
            console.log("📄 Processed as plain text file.");
        }
        // 📄 STANDARD: Parse as PDF using pdf2json
        else if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
            const pdfParser = new PDFParser(this, 1); // 1 = text only mode

            // Create a promise to handle the event-based parser
            rawText = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                // Load the buffer directly
                pdfParser.parseBuffer(req.file.buffer);
            });

            console.log('📑 Processed as PDF file.');
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please use .pdf or .txt' });
        }

        // Semantic chunking (splitting by paragraphs)
        const chunks = rawText.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 50);

        await storeDocumentChunks(chunks);

        res.json({ message: 'Document ingested successfully', chunksProcessed: chunks.length });
    } catch (error) {
        console.error("❌ Processing Error:", error);
        res.status(500).json({ error: 'Failed to process document. Try a .txt file instead.' });
    }
});

module.exports = router;