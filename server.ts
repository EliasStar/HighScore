import fs from 'fs';
import http from 'http';
import https from 'https';
import express, { ErrorRequestHandler } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import csurf from 'csurf';
import hbs from 'hbs';

import indexRouter from './routes/index';
import studentRouter from './routes/student';
import teacherRouter from './routes/teacher';
import commonRouter from './routes/common';
import staticRouter from './routes/static';

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
app.set('view engine', 'hbs');
app.set('views', join(__dirname, 'views'));
hbs.registerPartials(join(__dirname, 'views'));


//Middleware
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'secret'));
app.use(helmet());
app.use(compression());
app.use(csurf({
    cookie: {
        key: 'csrfToken',
        signed: true,
        secure: true,
        httpOnly: true,
        sameSite: true,
    },
    value: (req) => {
        return req.body.csrfToken;
    }
}));

//Routes
app.use('/', indexRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/common', commonRouter);
app.use('/static', staticRouter);

//Error Handlers
app.use((req, res, nxt) => {
    res.status(404).redirect('/');
});

app.use(<ErrorRequestHandler>((err, req, res, nxt) => {
    res.status(500).render('common/error', { error: err });
}));

https.createServer({
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.crt')
}, app).listen(httpsPort, () => {
    console.log('Main server listening on ' + httpsPort);
});
