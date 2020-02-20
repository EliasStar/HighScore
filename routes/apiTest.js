const http2 = require('http2');
const express = require('express');
const router = express.Router();

router.get('/', function (_req, _res, _next) {
    _res.setHeader('content-type', 'text/plain')

    let body = 'request=studentList';

    const client = http2.connect('https://www.dachsberg.at:443');
    client.on('error', (err) => console.error(err));

    const req = client.request({
        ':method': 'POST',
        ':path': '/services/_api/scoreService.php',
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
    });

    _res.write('REQUEST\n\n');

    for (const name in req.sentHeaders) {
        _res.write(`${name}: ${req.sentHeaders[name]}\n`);
    }
    _res.write(body);

    _res.write('\n\n\nRESPONSE\n\n');

    req.on('response', (headers, flags) => {
        for (const name in headers) {
            _res.write(`${name}: ${headers[name]}\n`);
        }
    });

    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
        _res.end(`\n${data}`);
        client.close();
    });
    req.end(body);
});

module.exports = router;
