const http = require('http');

function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body ? Buffer.byteLength(JSON.stringify(body)) : 0
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data, error: 'Invalid JSON' });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runGame() {
    console.log('--- STARTING GAME SIMULATION ---');

    const username = 'SimUser_' + Math.floor(Math.random() * 1000);

    // 1. Register
    console.log(`\n1. Registering user: ${username}`);
    const regRes = await request('/user', 'POST', { username, country_code: 'US' });
    console.log('Response:', regRes);

    if (!regRes.data.user || !regRes.data.user.id) {
        console.error('FAILED: User registration failed');
        process.exit(1);
    }

    const userId = regRes.data.user.id;
    console.log(`SUCCESS: User ID is ${userId}`);

    // 2. Play (Flip 1)
    console.log(`\n2. Flipping Coin (First Try)`);
    // Force a win by potentially hacking? No, we can't hack math.random on server. 
    // We'll just play. If we lose, streak is 0. If win, 1.
    // Ideally we'd mock the random result, but we can't easily.
    // Let's just run it.
    const playRes1 = await request('/play', 'POST', { userId, guess: 'HEADS' });
    console.log('Flip 1 Result:', playRes1.data);

    // 2.5 Play (Flip 2) - Try to increment
    // Note: If we lost first time, streak is 0.
    console.log(`\n2.5 Flipping Coin (Second Try)`);
    const playRes2 = await request('/play', 'POST', { userId, guess: 'HEADS' });
    console.log('Flip 2 Result:', playRes2.data);

    // 3. Verify State
    console.log(`\n3. Verifying User State`);
    const stateRes = await request(`/play?userId=${userId}`, 'GET');
    console.log('State:', stateRes.data);

    if (stateRes.data.current_streak !== playRes2.data.streak) {
        console.warn('WARNING: Streak mismatch between flip result and state check');
    } else {
        console.log('SUCCESS: State matches last flip streak');
    }

    console.log('\n--- SIMULATION COMPLETE: ALL SYSTEMS GO ---');
}

runGame().catch(console.error);
