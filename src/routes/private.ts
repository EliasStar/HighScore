import express from 'express';
import mongo from 'mongoose';

import Sport from '../models/sport';
import performanceSchema from '../models/performance';
import * as Student from '../models/student';

const privateRouter = express.Router();

privateRouter.use((req, res, nxt) => {
    if (!req.auth.authenticated) {
        res.status(401).render("public/auth/unauthorized");
    } else {
        nxt();
    }
});

privateRouter.get('/overview', async (req, res) => {
    const sports = await Sport.find();

    res.render('private/overview', {
        teacher: req.auth.teacher,
        sports: sports
    });
});

privateRouter.get('/sport/:id', async (req, res) => {
    if (!req.auth.teacher) {
        res.redirect(308, `/private/sport/${req.params.id}/${req.auth.id}`);
    }

    try {
        const sport = await Sport.findById(req.params.id);
        if (!sport) { throw null; }

        const Performance = mongo.model(sport.id);

        const entries: ({ entry?: boolean } & mongo.Document)[] = await Performance.find();

        entries.forEach(entry => entry.entry = true);

        res.render('private/sport', {
            all: true,
            sport: sport,
            entries: entries
        });
    } catch (err) {
        res.redirect(404, "/private/overview");
    }
});

privateRouter.get('/sport/:sport/:student', async (req, res) => {
    //! Check if student may access info
    try {
        const sport = await Sport.findById(req.params.sport);
        if (!sport) { throw null; }

        const student = Student.findById(req.params.student);
        if (!student) { throw null; }

        const Performance = mongo.model(sport.id);

        const entries = await Performance.find({ student: req.params.student });

        res.render('private/student', {
            csrfToken: req.csrfToken(),
            teacher: req.auth.teacher,
            sport: sport,
            student: student,
            entries: entries
        });
    } catch (err) {
        res.redirect(404, "/private/overview");
    }
});

privateRouter.delete('/sport/:sport/:student/:id', async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render('public/auth/forbidden');
        return;
    }

    //! Check if not deleting sport
    try {
        const Performance = mongo.model(req.params.sport);

        await Performance.remove({ _id: req.params.id, student: req.params.student });

        res.redirect(303, `/private/sport/${req.params.sport}/${req.params.student}?gender=${req.filter.gender}&class=${req.filter.class}`);
    } catch (err) {
        switch (err.name) {
            case "MissingSchemaError":
                res.status(400).send("Cannot find specified sport. Try reloading the page!");
                break;

            default:
                res.status(500).send("Something went wrong while trying to save the sport. Try again!");
                break;
        }
    }
});

privateRouter.get('/new/sport', (req, res) => {
    if (req.auth.teacher) {
        res.render('private/new/sport', { csrfToken: req.csrfToken() });
    } else {
        res.status(403).render('public/auth/forbidden');
    }
});

privateRouter.post('/new/sport', async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render('public/auth/forbidden');
        return;
    }

    try {
        const sport = new Sport({
            name: req.body.name,
            unit: req.body.unit,
            unitSymbol: req.body.unitSymbol
        })

        await sport.save();

        mongo.model(sport.id, performanceSchema, sport.id);

        res.redirect(303, `/private/sport/${sport.id}?gender=${req.filter.gender}&class=${req.filter.class}`);
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
});

privateRouter.get('/new/performance/:sport?/:student?', async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render('public/auth/forbidden');
        return;
    }

    try {
        const sports: ({ selected?: boolean } & mongo.Document)[] = await Sport.find();
        const students: ({ selected?: boolean } & Student.Student)[] = Student.find(req.filter.gender, req.filter.class);

        let sportSelected = false;
        let studentSelected = false;

        if (req.params.sport) {
            for (const sport of sports) {
                if (req.params.sport === sport.id) {
                    sport.selected = true;
                    sportSelected = true;
                    break;
                }
            }
        }

        if (req.params.student) {
            for (const student of students) {
                if (req.params.student === student.id.toString()) {
                    student.selected = true;
                    studentSelected = true;
                    break;
                }
            }
        }

        res.render('private/new/performance', {
            csrfToken: req.csrfToken(),
            sports: sports,
            students: students,
            sportSelected: sportSelected,
            studentSelected: studentSelected
        });
    } catch (err) {
        res.redirect(404, "/private/overview");
    }
});

privateRouter.post('/new/performance', async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render('public/auth/forbidden');
        return;
    }

    try {
        const performance = new (mongo.model(req.body.sport))({
            student: req.body.student,
            score: req.body.score,
            teacher: req.auth.id
        });

        await performance.save();

        res.redirect(303, `/private/sport/${req.body.sport}?gender=${req.filter.gender}&class=${req.filter.class}`);
    } catch (err) {
        switch (err.name) {
            case "MissingSchemaError":
                res.status(400).send("Cannot find specified sport. Try reloading the page!");
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
});

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;