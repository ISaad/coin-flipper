const http = require('http');

async function testFlip(userId) {
    console.log(`Testing flip for userId: ${userId}`);
    const postData = JSON.stringify({
        userId: userId,
        guess: 'HEADS'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/play',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('BODY:', data);
        });
    });

    req.on('error', (e) => console.error(e));
    req.write(postData);
    req.end();
}

// Get user ID first
const regData = JSON.stringify({ username: 'FlipTester' });
const regOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regData)
    }
};

const regReq = http.request(regOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const body = JSON.parse(data);
        if (body.user && body.user.id) {
            testFlip(body.user.id);
        } else {
            console.log('Failed to register', body);
        }
    });
});
regReq.write(regData);
regReq.end();
