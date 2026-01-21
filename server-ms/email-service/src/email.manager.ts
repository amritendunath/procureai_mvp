import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
import { simpleParser } from 'mailparser';

dotenv.config();

const smtpConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const emailManager = {
  async sendEmail(to: string, subject: string, text: string) {
    if (!process.env.EMAIL_USER) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}\nBody: ${text}`);
      return;
    }
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  },

  async fetchResponses(rfpId: string): Promise<Array<{ from: string, body: string, subject: string }>> {
    const imapConfig = {
        host: process.env.IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_PORT || '993'),
        secure: true,
        auth: {
            user: process.env.IMAP_USER || process.env.EMAIL_USER,
            pass: process.env.IMAP_PASS || process.env.EMAIL_PASS,
        },
        logger: false
    };

    if (!imapConfig.auth.user) {
        console.warn("[MOCK IMAP] Generating simulated vendor response for demo.");
        return [{
            from: "sales@techcorp.com",
            subject: `Re: Request for Proposal: Laptops [RFP #${rfpId}]`,
            body: `
Hi there,

Thanks for the RFP. We can supply the 20 laptops you requested.
Our price is $2,200 per unit, so $44,000 total.
We can deliver in 14 days.
Warranty is 2 years included.

Pros: Fast delivery, Extended warranty.
Cons: Payment upfront required.

Best,
TechCorp Sales
            `
        }];
    }

    const client = new ImapFlow(imapConfig as any);
    const results: Array<{ from: string, body: string, subject: string }> = [];

    try {
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
            const searchCriteria = {
                subject: `[RFP #${rfpId}]` 
            };
            
            for await (const message of client.fetch(searchCriteria, { source: true, envelope: true })) {
                if (!message.source || !message.envelope || !message.envelope.from) continue;

                const parsed = await simpleParser(message.source as any);
                const from = message.envelope.from[0]?.address || "unknown";
                const subject = message.envelope.subject || "";
                const body = parsed.text || "No text content";
                
                results.push({ from, body, subject });
            }
        } finally {
            lock.release();
        }
        await client.logout();
    } catch (err) {
        console.error("IMAP Error:", err);
    }

    return results;
  }
};
