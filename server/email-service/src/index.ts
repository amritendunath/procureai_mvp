import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailManager } from './email.manager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.post('/send', async (req, res) => {
    try {
        const { to, subject, text } = req.body;
        await emailManager.sendEmail(to, subject, text);
        res.json({ success: true });
    } catch (error: any) {
        console.error("Email Service Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/fetch-responses', async (req, res) => {
    try {
        const { rfpId } = req.query;
        if (!rfpId) throw new Error("rfpId is required");
        
        const responses = await emailManager.fetchResponses(String(rfpId));
        res.json(responses);
    } catch (error: any) {
        console.error("Email Service Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Email Service running on port ${PORT}`);
});
