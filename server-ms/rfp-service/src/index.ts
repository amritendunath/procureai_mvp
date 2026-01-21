import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3004';

app.use(cors());
app.use(express.json());

// RFP Routes
app.post('/rfps', async (req, res) => {
    try {
        const { prompt } = req.body; 
        console.log(`[RFP Service] Received new RFP request: "${prompt.substring(0, 50)}..."`);
        
        console.log(`[RFP Service] Requesting AI structure extraction...`);
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/extract-structure`, { prompt });
        const structure = aiResponse.data;
        console.log(`[RFP Service] AI Structure received: ${structure.title}`);
        
        const rfp = await prisma.rfp.create({
            data: {
                title: structure.title || "Untitled RFP",
                description: prompt,
                structuredData: JSON.stringify(structure),
                status: 'draft'
            }
        });
        console.log(`[RFP Service] RFP Created. ID: ${rfp.id}`);
        res.json(rfp);
    } catch (error: any) {
        console.error("Create RFP Error:", error.message);
        res.status(500).json({ error: "Failed to create RFP" });
    }
});

app.get('/rfps', async (req, res) => {
    const rfps = await prisma.rfp.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { proposals: true } } }
    });
    res.json(rfps);
});

app.get('/rfps/:id', async (req, res) => {
    const rfp = await prisma.rfp.findUnique({
        where: { id: req.params.id },
        include: { proposals: { include: { vendor: true } } }
    });
    res.json(rfp);
});

app.post('/rfps/:id/send', async (req, res) => {
    const { vendorIds } = req.body;
    const rfp = await prisma.rfp.findUnique({ where: { id: req.params.id } });
    if (!rfp) return res.status(404).json({ error: "RFP not found" });

    const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } }
    });

    const structure = JSON.parse(rfp.structuredData);
    
    // Format items list
    const itemsList = structure.items
        ? structure.items.map((item: any) => `- ${item.quantity}x ${item.name} (${item.specs})`).join('\n')
        : "See description.";

    const emailBody = `
Dear Vendor,

We are requesting a proposal for the following requirement:

**Title:** ${structure.title}
**Overview:** ${rfp.description}

**Required Items:**
${itemsList}

**Target Budget:** ${structure.budget ? `$${structure.budget.toLocaleString()}` : 'Negotiable'}
**Target Delivery:** ${structure.deliveryDate || structure.dueDate || 'ASAP'}

Please reply to this email with your formal quote.
Required: Your response MUST include the tag [RFP #${rfp.id}] in the Subject Line.

Regards,
Procurement Team
    `;

    for (const vendor of vendors) {
        try {
            await axios.post(`${EMAIL_SERVICE_URL}/send`, {
                to: vendor.email,
                subject: `Request for Proposal: ${rfp.title} [RFP #${rfp.id}]`,
                text: emailBody
            });
        } catch (e: any) {
            console.error(`Failed to send email to ${vendor.email}:`, e.message);
        }
    }

    await prisma.rfp.update({
        where: { id: rfp.id },
        data: { status: 'sent' }
    });

    res.json({ success: true, count: vendors.length });
});

app.post('/rfps/:id/check-responses', async (req, res) => {
    const { id } = req.params;
    try {
        const emailResponse = await axios.get(`${EMAIL_SERVICE_URL}/fetch-responses`, { params: { rfpId: id } });
        const emails = emailResponse.data;
        const newProposals = [];

        for (const email of emails) {
            let vendor = await prisma.vendor.findUnique({ where: { email: email.from } });
            if (!vendor) continue; 

            // Check duplicate
            const existingProposal = await prisma.proposal.findFirst({
                where: {
                    rfpId: id,
                    vendorId: vendor.id,
                    content: email.body 
                }
            });

            if (existingProposal) continue;
            
            const aiAnalysis = await axios.post(`${AI_SERVICE_URL}/parse-proposal`, { emailBody: email.body });
            const analysis = aiAnalysis.data;
            
            const proposal = await prisma.proposal.create({
                data: {
                    rfpId: id,
                    vendorId: vendor.id,
                    content: email.body,
                    structuredAnalysis: JSON.stringify(analysis),
                    score: 0 
                }
            });
            newProposals.push(proposal);
        }

        res.json({ count: newProposals.length, proposals: newProposals });
    } catch (e: any) {
        console.error("Check responses error:", e.message);
        res.status(500).json({ error: "Failed to check responses" });
    }
});

app.get('/rfps/:id/comparison', async (req, res) => {
    const { id } = req.params;
    const rfp = await prisma.rfp.findUnique({
        where: { id },
        include: { proposals: { include: { vendor: true } } }
    });
    
    if (!rfp || rfp.proposals.length === 0) {
        return res.json({ analysis: "No proposals to compare." });
    }

    const simpleProposals = rfp.proposals.map((p: any) => ({
        vendor: p.vendor.name,
        data: JSON.parse(p.structuredAnalysis)
    }));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/compare`, { proposals: simpleProposals });
    res.json(aiResponse.data);
});

app.delete('/rfps/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[RFP Service] Deleting RFP ${id}...`);
        const deleteProposals = await prisma.proposal.deleteMany({ where: { rfpId: id } });
        console.log(`[RFP Service] Deleted ${deleteProposals.count} related proposals.`);
        
        await prisma.rfp.delete({ where: { id } });
        console.log(`[RFP Service] RFP deleted successfully.`);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete RFP Error:", error);
        res.status(500).json({ error: "Failed to delete RFP" });
    }
});

app.listen(PORT, () => {
    console.log(`RFP Service running on port ${PORT}`);
});
