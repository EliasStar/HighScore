import express from 'express';
import http2 from 'http2';
const router = express.Router();

router.get('/', (request, response) => {
    response.setHeader('content-type', 'text/plain')

    let body = 'request=studentList';

    const client = http2.connect('https://www.dachsberg.at:443');
    client.on('error', (err) => console.error(err));

    const req = client.request({
        ':method': 'POST',
        ':path': '/services/_api/scoreService.php',
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
    });

    response.write('REQUEST\n\n');

    for (const name in req.sentHeaders) {
        response.write(`${name}: ${req.sentHeaders[name]}\n`);
    }
    response.write(body);

    response.write('\n\n\nRESPONSE\n\n');

    req.on('response', (headers, flags) => {
        for (const name in headers) {
            response.write(`${name}: ${headers[name]}\n`);
        }
    });

    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
        response.end(`\n${data}`);
        client.close();
    });
    req.end(body);
});

export default router;