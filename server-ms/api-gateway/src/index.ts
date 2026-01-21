import express from 'express';
import proxy from 'express-http-proxy';

const app = express();
const PORT = 8000;

app.get('/health', (req, res) => {
    res.json({ status: "Gateway OK" });
});

// Service URLs from Env or Default to Localhost
const VENDOR_SERVICE_URL = process.env.VENDOR_SERVICE_URL || 'http://localhost:3001';
const RFP_SERVICE_URL = process.env.RFP_SERVICE_URL || 'http://localhost:3002';

// Proxy Vendor Service
app.use('/api/vendors', proxy(VENDOR_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return '/vendors' + req.url;
    }
}));

// Proxy RFP Service
app.use('/api/rfps', proxy(RFP_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return '/rfps' + req.url;
    }
}));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
