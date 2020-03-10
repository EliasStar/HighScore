import fs from 'fs';
import http from 'http';
import https from 'https';
import express, { ErrorRequestHandler } from 'express';
import { join } from 'path';
import cookies from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import csurf from 'csurf';

import indexRouter from './routes/index';
import apiTestRouter from './routes/apiTest';
import viewTestRouter from './routes/viewTest';

// HTTP Redirect Server
const httpPort = process.env.HTTP_PORT || '80';

http.createServer((req, res) => {
    console.log('Redirected request from HTTP to HTTPS!')
    res.writeHead(303, {
        'Location': 'https://' + req.headers.host?.replace(httpPort.toString(), httpsPort.toString()) + req.url
    });
    res.end();
}).listen(httpPort, () => {
    console.log('HTTP Redirect listening on ' + httpPort);
});


//Main Server
const httpsPort = process.env.HTTPS_PORT || '443';
const app = express();

//Options
app.set('port', httpsPort);
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Middleware
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(cookies());
app.use(helmet());
app.use(compression());
app.use(csurf({
    cookie: {
        key: 'csrfToken',
        signed: true,
        secure: true,
        httpOnly: true,
        sameSite: true
    },
    value: (req) => {
        return req.body.csrfToken;
    }
}));

//Routes
app.use('/', indexRouter);
app.use('/apiTest', apiTestRouter);
app.use('/viewTest', viewTestRouter);

//Error Handlers
app.use((req, res, nxt) => {
    res.status(404).redirect('/');
});

app.use(<ErrorRequestHandler>((err, req, res, nxt) => {
    res.status(500).render('error', { error: err });
}));

https.createServer({
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.crt')
}, app).listen(httpsPort, () => {
    console.log('Main server listening on ' + httpsPort);
});
