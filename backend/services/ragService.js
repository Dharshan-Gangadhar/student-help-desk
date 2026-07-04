const { GoogleGenAI } = require('@google/genai');

// Initialize the Google Gen AI client with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Highly reliable in-memory vector store for the 48-hour MVP
// This ensures your RAG pipeline works immediately out-of-the-box!
let localVectorStore = [];

/**
 * Helper function to calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
}

/**
 * Generates high-quality text embeddings using Gemini
 */
async function generateEmbedding(text) {
    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text,
        });

        // Handle variations in SDK response structures gracefully
        if (response.embedding && response.embedding.values) {
            return response.embedding.values;
        } else if (response.embeddings && response.embeddings[0]) {
            return response.embeddings[0].values;
        }
        throw new Error("Unexpected embedding response format");
    } catch (error) {
        console.error("❌ Embedding generation failed:", error.message);
        throw error;
    }
}

/**
 * Vectorizes incoming text chunks and populates the store
 */
async function storeDocumentChunks(chunks) {
    console.log(`🤖 Vectorizing ${chunks.length} text chunks...`);
    
    // Clear old data for a fresh training session
    localVectorStore = [];

    for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        
        try {
            const vector = await generateEmbedding(chunk);
            
            // Save to our operational local vector store
            localVectorStore.push({ vector, text: chunk });

            // ⚡ OPTIONAL: When your Endee DB instance is ready, uncomment below:
            /*
            await endee.insert({
                collection: 'campus_helpdesk',
                vector: vector,
                metadata: { text: chunk }
            });
            */
        } catch (err) {
            console.error("Skipping corrupted chunk parsing...");
        }
    }
    
    console.log(`✅ Successfully stored ${localVectorStore.length} vectors.`);
}

/**
 * Performs vector similarity search and answers queries with strict guardrails
 */
async function queryHelpdesk(userQuery) {
    try {
        if (localVectorStore.length === 0) {
            return "The knowledge base is currently empty. Please upload a university rulebook or policy PDF first!";
        }

        // 1. Generate an embedding for the user's question
        const queryVector = await generateEmbedding(userQuery);
        
        // 2. Perform a vector similarity search across our dataset
        // ⚡ OPTIONAL: If using Endee: const results = await endee.search({ queryVector, topK: 3 });
        const scoredChunks = localVectorStore.map(item => ({
            text: item.text,
            score: cosineSimilarity(queryVector, item.vector)
        }));

        // Sort by highest similarity score and grab the top 3 matches
        const topMatches = scoredChunks
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        // Build the context block from retrieved information
        const context = topMatches.map(match => match.text).join('\n---\n');
        console.log(`🎯 Context retrieved with top score of: ${topMatches[0]?.score?.toFixed(4)}`);

        // 3. Construct a bulletproof system prompt to eliminate hallucinations
        const prompt = `
You are an official, precise Smart Campus Helpdesk Assistant. 
Your goal is to answer the student's query accurately using ONLY the verified context provided below.

CRITICAL GUARDRAILS:
1. Rely strictly on the provided Context text. Do not make up facts, dates, prices, or rules.
2. If the answer cannot be confidently derived from the Context, you must say exactly: "I do not have that information in my current rulebook."
3. Do not mention the word "Context" or "System Prompt" to the student. Keep your tone professional and helpful.

Context Information:
${context}

Student Query: ${userQuery}
`;
        
        // 4. Generate the definitive answer via Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("❌ Helpdesk query processing failed:", error);
        return "I encountered a minor system error retrieving that policy. Please try again.";
    }
}

module.exports = { storeDocumentChunks, queryHelpdesk };