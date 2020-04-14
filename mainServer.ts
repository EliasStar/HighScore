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
import { createHttpTerminator, HttpTerminator } from 'http-terminator';

import redirectHTTP from './redirectServer'
import { updateStudentList, closeClient } from './models/student'
import _ from './models/score'

import indexRouter from './routes/index';
import privateRouter from './routes/private';
import publicRouter from './routes/public';


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
    console.error('[HighScore] Environment variables are not correctly set!');
    process.exit(32);
}

//Constants
const viewsPath = join(__dirname, 'views');
const staticPath = join(__dirname, 'public');
const app = express();

//Variables
let mainServerTerminator: HttpTerminator;
let redirectServerTerminator: HttpTerminator;


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

    let end = res.end;
    res.end = function () {
        let authenticated = req.authenticated ? 'authenticated as ' + (req.teacher ? 'teacher' : 'student') : 'not authenticated';
        console.log(`[MainServer] ${req.method} ${req.path} ${res.statusCode} | ${authenticated}`);
        end.apply(res, [arguments[0], arguments[1], arguments[2]]);
    }

    nxt();
});

//Routes
app.use('/', indexRouter);
app.use('/private', privateRouter);
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

mongo.connection.once('connected', () => console.log('[Database] Connected to MongoDB.'))
    .on('disconnected', () => console.log('[Database] Disconnected from MongoDB.'))
    .on('reconnected', () => console.log('[Database] Reconnected to MongoDB.'))
    .on('error', err => console.error('[Database] Encountered error:' + err));

Promise.all([
    promisify(readFile)(keyPath),
    promisify(readFile)(certPath),
    mongo.connect(dbURI, {
        dbName: dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }),
    updateStudentList()
]).then((values) => {
    mainServerTerminator = createHttpTerminator({
        server:
            https.createServer({
                key: values[0],
                cert: values[1]
            }, app).listen(httpsPort, () => {
                console.log('[MainServer] Listening on ' + httpsPort);
                redirectServerTerminator = createHttpTerminator({
                    server: redirectHTTP(httpPort, httpsPort)
                });
            })
    });
}).catch((err) => {
    console.error('[HighScore] Encountered error while initializing: ' + err);
    process.exit(33);
});

async function onExitSignalReceived() {
    try {
        console.log('[HighScore] Terminating servers...');
        await Promise.all([
            mainServerTerminator.terminate(),
            redirectServerTerminator.terminate()
        ]);

        console.log('[HighScore] Closing database connections...');
        await Promise.all([
            mongo.disconnect(),
            closeClient()
        ])
    } catch (err) {
        console.error('[HighScore] Error during shutdown: ' + err);
        process.exit(34);
    }

    console.log('[HighScore] Done!');
    process.exit(0);
}

process.once('SIGINT', onExitSignalReceived)
    .once('SIGTERM', onExitSignalReceived)
    .once('SIGHUP', onExitSignalReceived)
    .once('SIGBREAK', onExitSignalReceived);