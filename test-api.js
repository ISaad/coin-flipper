const http = require('http');

const postData = JSON.stringify({
    username: 'TestUser',
    country_code: 'US'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', data);
        try {
            JSON.parse(data);
            console.log('SUCCESS: Body is valid JSON');
        } catch (e) {
            console.error('FAILURE: Body is NOT valid JSON');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
