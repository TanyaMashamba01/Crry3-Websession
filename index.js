const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;

const pairRouter = require('./pair');
const { sessionResults } = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// ─── Track uptime ───────────────────────────────────────────────
const timestampFile = path.join(__path, '.creation_time');
let creationTime;
if (fs.existsSync(timestampFile)) {
    creationTime = parseInt(fs.readFileSync(timestampFile, 'utf8').trim(), 10);
} else {
    creationTime = Date.now();
    fs.writeFileSync(timestampFile, String(creationTime));
}

// ─── Middleware ──────────────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ─── API Routes ──────────────────────────────────────────────────

// Pair code API — called by pair.html fetch('/code?number=...')
app.use('/code', pairRouter);

// Session status polling
app.get('/session-status/:id', (req, res) => {
    const result = sessionResults[req.params.id];
    if (!result) return res.json({ status: 'not_found' });
    res.json(result);
});

// Uptime
app.get('/uptime', (req, res) => {
    const uptimeMs = Date.now() - creationTime;
    const seconds = Math.floor(uptimeMs / 1000) % 60;
    const minutes = Math.floor(uptimeMs / 60000) % 60;
    const hours = Math.floor(uptimeMs / 3600000) % 24;
    const days = Math.floor(uptimeMs / 86400000);
    res.json({
        uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        startedAt: new Date(creationTime).toISOString(),
        uptimeMs
    });
});

// ─── HTML Page Routes ────────────────────────────────────────────

// Landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html'));
});

// Pair code page
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

// QR scan page
app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, 'qr.html'));
});

// ─── Start Server ────────────────────────────────────────────────
app.listen(port, '0.0.0.0', () => {
    console.log(`📡 CRAZY-X running on http://0.0.0.0:${port}`);
});

module.exports = app;