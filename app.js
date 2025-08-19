const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// WhatsApp Client initialization
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

// Generate Session ID
function generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sessionId = 'EX-';
    for(let i = 0; i < 7; i++) {
        sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sessionId;
}

// Store active sessions
const activeSessions = new Map();

// WhatsApp Events
client.on('qr', (qr) => {
    console.log('QR Code received:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-session', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const sessionId = generateSessionId();
    const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    // Store session
    activeSessions.set(sessionId, {
        phoneNumber,
        expiryTime
    });

    // Format phone number (remove + if present and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace('+', '') + '@c.us';

    try {
        // Send WhatsApp message with session ID
        await client.sendMessage(formattedPhone, `Verification successful ✅\nYour session ID is now active:\n\n🆔 Session ID: ${sessionId}\n⏳ Valid for 10 minutes\n\nUse this to pair your device.\n───────────\n*ESSENCES-X © 2025*`);

        res.json({ 
            success: true, 
            sessionId,
            message: 'Session ID has been sent to your WhatsApp number' 
        });

        // Clean up expired session after 10 minutes
        setTimeout(() => {
            activeSessions.delete(sessionId);
        }, 10 * 60000);

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ 
            error: 'Failed to send session ID to WhatsApp',
            details: error.message 
        });
    }
});

// Verify session ID
app.post('/verify-session', (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found or expired' });
    }

    if (new Date() > session.expiryTime) {
        activeSessions.delete(sessionId);
        return res.status(401).json({ error: 'Session has expired' });
    }

    res.json({ 
        valid: true,
        message: 'Session is valid',
        expiresAt: session.expiryTime
    });
});

// Initialize WhatsApp client
client.initialize();

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
