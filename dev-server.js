const http = require('http');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import API handlers
const playHandler = require('./api/play');
const leaderboardHandler = require('./api/leaderboard');
const userHandler = require('./api/user');

const PORT = 3000;

// Override console logging to file
const logStream = fs.createWriteStream(path.join(__dirname, 'server_debug.log'), { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;

function formatLog(args) {
    return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
}

console.log = function (...args) {
    const msg = `[INFO] ${new Date().toISOString()} - ${formatLog(args)}\n`;
    logStream.write(msg);
    process.stdout.write(msg); // Keep terminal output
};

console.error = function (...args) {
    const msg = `[ERROR] ${new Date().toISOString()} - ${formatLog(args)}\n`;
    logStream.write(msg);
    process.stderr.write(msg); // Keep terminal output
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set req.query for consistency with Vercel
    req.query = parsedUrl.query;

    const logMsg = `${new Date().toISOString()} ${req.method} ${pathname}\n`;
    fs.appendFileSync('server_log.txt', logMsg);
    console.log(`${req.method} ${pathname}`);

    // Handle API routes
    if (pathname.startsWith('/api/')) {
        // Parse body for POST requests
        const bodyPromise = new Promise((resolve) => {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({});
                    }
                });
            } else {
                resolve({});
            }
        });

        try {
            req.body = await bodyPromise;

            // Route matching
            if (pathname === '/api/play') {
                await playHandler(req, res);
            } else if (pathname === '/api/leaderboard') {
                await leaderboardHandler(req, res);
            } else if (pathname === '/api/user') {
                await userHandler(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
            }
        } catch (e) {
            console.error('API Handler Error:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        return;
    }

    // Serve static files from public directory
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

    if (!fs.existsSync(filePath)) {
        // Single Page App fallback? Not strictly needed here but good practice
        // filePath = path.join(__dirname, 'public', 'index.html');
        res.writeHead(404);
        return res.end('Not Found');
    }

    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(500);
            res.end('Error loading file');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🪙 Fliply Dev Server running at:`);
    console.log(`   http://localhost:${PORT}\n`);
});
