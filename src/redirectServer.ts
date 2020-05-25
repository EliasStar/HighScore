import http from 'http';

export default (httpPort: number, httpsPort: number) => http.createServer((req, res) => {
    console.log('[RedirectServer] Redirected request from HTTP to HTTPS!')
    res.writeHead(301, {
        'Location': 'https://' + req.headers.host?.replace(httpPort.toString(), httpsPort.toString()) + req.url
    });
    res.end();
}).listen(httpPort, () => {
    console.log('[RedirectServer] Listening on ' + httpPort);
});