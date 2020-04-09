import http2 from 'http2';

let body = 'request=studentList';

const client = http2.connect('https://www.dachsberg.at:443');
client.on('error', (err) => console.error(err));

const req = client.request({
    ':method': 'POST',
    ':path': '/services/_api/scoreService.php',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': Buffer.byteLength(body)
});

req.on('response', (headers, flags) => {
    for (const name in headers) {
        console.log(`${name}: ${headers[name]}\n`);
    }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
    console.log(`\n${data}`);
    client.close();
});
req.end(body);