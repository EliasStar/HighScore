import express from 'express';
import mongo from 'mongoose';

import Sport from '../models/sport';
import ScoreSchema from '../models/score';

const privateRouter = express.Router();

privateRouter.use((req, res, nxt) => {
    if (req.authenticated) {
        nxt();
    } else {
        res.status(401).render("public/auth/unauthorized");
    }
});

privateRouter.get('/overview', (req, res) => {
    res.render('private/overview', {
        sports: [
            {
                id: '1',
                name: '100m Sprint',
                score: '5.5',
                unitSymbol: 's',
                student: 'Ich'
            },
            {
                id: '2',
                name: '400m Sprint',
                score: '9.34',
                unitSymbol: 's',
                student: 'Du'
            },
            {
                id: '3',
                name: 'Seil springen',
                score: '10000',
                unitSymbol: 'x'
            }
        ]
    });
});

privateRouter.get('/new/sport', (req, res) => {
    if (req.teacher) {
        res.render('private/new/sport', { csrfToken: req.csrfToken() });
    } else {
        res.status(403).render('public/auth/forbidden');
    }
});

privateRouter.post('/new/sport', async (req, res) => {
    if (req.teacher) {
        try {
            const sport = new Sport({
                name: req.body.name,
                unitName: req.body.unitName,
                unit: req.body.unit
            })

            await sport.save();

            mongo.model(sport.id, ScoreSchema, sport.id);

            //res.redirect(`private/sport/${sport.id}`, 300);
            res.redirect(303, `/private/overview?class=${req.query.class || 'ALL'}&gender=${req.query.gender || 'A'}`);
        } catch (err) {
            if (err instanceof mongo.Error.ValidationError) {
                res.status(400).send(err);
            } else {
                res.status(500).send('Error while saving sport. Try again!');
            }
        }
    } else {
        res.status(403).render('public/auth/forbidden');
    }
});

privateRouter.get('/sport/:id', (req, res) => {
    res.render('private/sport', {

    });
});

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;