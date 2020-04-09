import express, { ErrorRequestHandler } from 'express';
import https from 'https';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import hbs from 'hbs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import csurf from 'csurf';
import mongo from 'mongoose';

import redirectHTTP from './redirectServer'

import indexRouter from './routes/index';
import privateRouter from './routes/private';
import publicRouter from './routes/public';
import { resolve } from 'dns';


//Environment variables
const debug = process.env.NODE_ENV === 'development';
const httpPort = parseInt(process.env.HTTP_PORT || '80', 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || '443', 10);
const dbURI = process.env.DATABASE_URI;
const dbName = process.env.DATABASE_NAME;
const cookieSecret = process.env.COOKIE_SECRET;
let keyPath = process.env.KEY_PATH;
let certPath = process.env.CERTIFICATE_PATH;

if (httpPort !== NaN && httpsPort !== NaN && dbURI !== undefined && dbName !== undefined && cookieSecret !== undefined && keyPath !== undefined && certPath !== undefined) {
    keyPath = join(__dirname, keyPath);
    certPath = join(__dirname, certPath);
} else {
    //! Error handling
    console.error('Environment variables not correctly set!');
    process.exit(1);
}

//Constants
const viewsPath = join(__dirname, 'views');
const staticPath = join(__dirname, 'public');
const app = express();

//Options
app.set('port', httpsPort);
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(viewsPath);

//Middleware
app.use(express.json());
app.use(cookieParser(cookieSecret));
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
app.use((req, res, nxt) => {
    //! Mock Auth
    req.authenticated = req.query.auth === "teacher" || req.query.auth === "student";
    req.teacher = req.query.auth === "teacher";
    nxt();
});

//Routes
app.use('/', indexRouter);
app.use((req, res, nxt) => {
    if (req.authenticated) {
        nxt();
    } else {
        res.render("public/login");
    }
});
app.use('/private', privateRouter)
app.use('/public', express.static(staticPath), publicRouter);

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

mongo.connection.on('connected', () => {
    //! Logging
    console.log('Connected.');
});
mongo.connection.on('disconnected', () => {
    //! Logging
    console.log('Disconnected.');
});
mongo.connection.on('reconnected', () => {
    //! Logging
    console.log('Reconnected.');
});
mongo.connection.on('error', err => {
    //! Logging
    console.error('Database error:' + err);
});

Promise.all([
    promisify(readFile)(keyPath),
    promisify(readFile)(certPath),
    mongo.connect(dbURI, {
        dbName: dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
]).then((values) => {
    https.createServer({
        key: values[0],
        cert: values[1]
    }, app).listen(httpsPort, () => {
        //! Logging
        console.log('Main server listening on ' + httpsPort);
        redirectHTTP(httpPort, httpsPort);
    })
}).catch((err) => {
    console.error(err);
    process.exit(1);
});