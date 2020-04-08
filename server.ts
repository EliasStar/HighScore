import express, { ErrorRequestHandler } from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { join } from 'path';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import csurf from 'csurf';
import mongo from 'mongoose';

import indexRouter from './routes/index';
import privateRouter from './routes/private';
import publicRouter from './routes/public';
import staticRouter from './routes/static';

// HTTP Redirect Server
const httpPort = process.env.HTTP_PORT || '80';

http.createServer((req, res) => {
    console.log('Redirected request from HTTP to HTTPS!')
    res.writeHead(301, {
        'Location': 'https://' + req.headers.host?.replace(httpPort.toString(), httpsPort.toString()) + req.url
    });
    res.end();
}).listen(httpPort, () => {
    console.log('HTTP Redirect listening on ' + httpPort);
});


//Main Server
const httpsPort = process.env.HTTPS_PORT || '443';
const debug = process.env.NODE_ENV === 'development';
const pathViews = join(__dirname, 'views');
const pathStatic = join(__dirname, 'public');
const pathKey = join(__dirname, 'key', 'server.key');
const pathCert = join(__dirname, 'key', 'server.crt');
const app = express();

//Options
app.set('port', httpsPort);
app.set('view engine', 'hbs');
app.set('views', pathViews);
hbs.registerPartials(pathViews);


//Middleware
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
app.use('/private', privateRouter)
app.use('/public', express.static(pathStatic), publicRouter);
app.use('/static', staticRouter);

//Error Handlers
app.use((req, res, nxt) => {
    res.redirect('/');
});

app.use(<ErrorRequestHandler>((err, req, res, nxt) => {
    if (res.headersSent) {
        return nxt(err);
    }

    if (debug) {
        console.error(err.stack);
        res.status(500).send(err.stack);
    } else {
        res.status(500).end();
    }
}));

mongo.connect('mongodb://db:27017/', {
    dbName: 'highscore',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, err => {
    //! Error handling
    console.log(err);
});

mongo.connection.once('load', () => {
    //! Logging
    console.log('Connected to database.');
});

https.createServer({
    //! Make Better
    key: fs.readFileSync(pathKey),
    cert: fs.readFileSync(pathCert)
}, app).listen(httpsPort, () => {
    //! Logging
    console.log('Main server listening on ' + httpsPort);
})