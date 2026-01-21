import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiManager } from './ai.manager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.post('/extract-structure', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log(`[AI Service] Processing structure extraction for: "${prompt.substring(0, 30)}..."`);
        const result = await aiManager.extractRfpStructure(prompt);
        console.log(`[AI Service] Extraction complete.`);
        res.json(result);
    } catch (error: any) {
        console.error("AI Service Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/parse-proposal', async (req, res) => {
    try {
        const { emailBody } = req.body;
        const result = await aiManager.parseProposal(emailBody);
        res.json(result);
    } catch (error: any) {
        console.error("AI Service Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/compare', async (req, res) => {
    try {
        const { proposals } = req.body;
        const result = await aiManager.compareProposals(proposals);
        res.json({ analysis: result });
    } catch (error: any) {
        console.error("AI Service Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`AI Service running on port ${PORT}`);
});
