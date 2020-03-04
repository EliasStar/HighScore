import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import { join } from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';

import indexRouter from './routes/index';
import apiTestRouter from './routes/index';

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
app.use(cookieParser());
//? app.use(express.json());
//? app.use(express.urlencoded());
app.use(logger('dev'));

//Routes
app.use('/', indexRouter);
app.use('/apiTest', apiTestRouter);

//404 Handler
app.use((req, res, nxt) => {
    //TODO 404 Handler
    res.sendStatus(404);
});

//TODO Error Handler

https.createServer({
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.crt')
}, app).listen(httpsPort, () => {
    console.log('Main server listening on ' + httpsPort);
});
