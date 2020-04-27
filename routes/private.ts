import express from 'express';
import mongo from 'mongoose';

import Sport from '../models/sport';
import scoreSchema from '../models/score';

const privateRouter = express.Router();

privateRouter.use((req, res, nxt) => {
    if (!req.authenticated) {
        res.status(401).render("public/auth/unauthorized");
    } else {
        nxt();
    }
});

privateRouter.get('/overview', async (req, res) => {
    const sports = await Sport.find().exec();

    res.render('private/overview', {
        sports: sports
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
                unit: req.body.unit,
                unitSymbol: req.body.unitSymbol
            })

            await sport.save();

            mongo.model(sport.id, scoreSchema, sport.id);

            //res.redirect(`private/sport/${sport.id}?gender=${req.query.gender}&class=${req.query.class}`, 300);
            res.redirect(303, `/private/overview?gender=${req.query.gender}&class=${req.query.class}`);
        } catch (err) {
            switch (err.name) {
                case "RangeError":
                    res.status(400).send(err.message);
                    break;
                case "MongoError":
                    res.status(400).send("The provided name is too similar. Choose a diffrent name for the new sport.");
                    break;

                case "ValidationError":
                    res.status(400).send("Some input are not correct. See if you forgot anything!");
                    break;

                default:
                    res.status(500).send("Something went wrong while trying to save the sport. Try again!");
                    break;
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