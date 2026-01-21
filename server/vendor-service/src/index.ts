import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Vendor Routes
app.get('/vendors', async (req, res) => {
  const vendors = await prisma.vendor.findMany();
  res.json(vendors);
});

app.post('/vendors', async (req, res) => {
  const { name, email, tags } = req.body;
  console.log(`[Vendor Service] Creating new vendor: ${name} (${email})`);
  const vendor = await prisma.vendor.create({
    data: { name, email, tags }
  });
  console.log(`[Vendor Service] Vendor created with ID: ${vendor.id}`);
  res.json(vendor);
});

app.delete('/vendors/:id', async (req, res) => {
  const { id } = req.params;
  try {
      console.log(`[Vendor Service] Deleting vendor ${id}...`);
      // Manually cascade delete proposals first
      const deleteProposals = await prisma.proposal.deleteMany({ where: { vendorId: id } });
      console.log(`[Vendor Service] Deleted ${deleteProposals.count} related proposals.`);
      
      await prisma.vendor.delete({ where: { id } });
      console.log(`[Vendor Service] Vendor deleted successfully.`);
      res.json({ success: true });
  } catch (error) {
      console.error("Delete Vendor Error:", error);
      res.status(500).json({ error: "Failed to delete vendor" });
  }
});

app.listen(PORT, () => {
    console.log(`Vendor Service running on port ${PORT}`);
});
