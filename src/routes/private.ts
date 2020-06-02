import express from "express";
import mongo from "mongoose";

import { getOverviewEntries } from './index';

import Sport from "../models/sport";
import { performanceSchema, PerformanceDocument } from "../models/performance";
import * as Student from "../models/student";

const privateRouter = express.Router();

privateRouter.use((req, res, nxt) => {
    if (!req.auth.authenticated) {
        res.status(401).render("public/auth/unauthorized");
    } else {
        nxt();
    }
});

privateRouter.get("/overview", async (req, res) => {
    res.render("private/overview", {
        teacher: req.auth.teacher,
        entries: await getOverviewEntries(req)
    });
});

privateRouter.get("/sport/:id", async (req, res) => {
    if (!req.auth.teacher) {
        res.redirect(308, `/private/sport/${req.params.id}/${req.auth.id}`);
    }

    try {
        const sport = await Sport.findById(req.params.id);
        if (sport == null) throw null;

        const Performance = mongo.model<PerformanceDocument>(sport.id);

        const students = Student.find(req.filter.gender, req.filter.class);

        const docs = await Performance.aggregate<{ _id: string, score: number }>([
            { $match: { student: { $in: students.map(student => student.id) } } },
            { $group: { _id: "$student", "score": { $max: "$score" } } }
        ]);

        const entries = students.map(student => {
            const doc = docs.find(doc => doc._id === student.id);

            if (doc != null) return {
                student: {
                    id: student.id,
                    name: Student.nameForID(student.id)
                },
                score: doc.score,
                filled: true
            };

            if (req.filter.class !== "ALL") return {
                student: {
                    id: student.id,
                    name: Student.nameForID(student.id)
                },
                filled: false
            };
        }).filter(entry => entry != null);

        res.render("private/sport", {
            sport: {
                id: sport._id,
                name: sport.name,
                unit: sport.unit,
                unitSymbol: sport.unitSymbol
            },
            entries: entries
        });
    } catch (err) {
        res.redirect(303, "/private/overview");
    }
});

privateRouter.get("/sport/:sport/:student", async (req, res) => {
    try {
        const sport = await Sport.findById(req.params.sport);
        if (sport == null) throw "sport";

        const student = Student.findById(req.auth.teacher ? req.params.student : req.auth.id || "");
        if (student == null) throw "student";

        const Performance = mongo.model<PerformanceDocument>(sport.id);

        const entries = await Performance.find({ student: req.params.student }).sort({ score: "descending" });

        res.render("private/student", {
            csrfToken: req.csrfToken(),
            teacher: req.auth.teacher,
            sport: {
                id: sport._id,
                name: sport.name,
                unit: sport.unit,
                unitSymbol: sport.unitSymbol
            },
            student: {
                id: student.id,
                name: student.name
            },
            entries: entries.map(entry => ({ id: entry._id, score: entry.score, teacher: entry.teacher }))
        });
    } catch (err) {
        if (err === "sport") {
            res.redirect(303, "/private/overview");
        } else if (err === "student") {
            res.redirect(303, `/private/sport/${req.params.sport}`);
        } else {
            res.status(500).send("Something went wrong. Try reloading the page!");
        }
    }
});

privateRouter.delete("/sport/:sport/:student/:id", async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render("public/auth/forbidden");
        return;
    }

    try {
        const sport = await Sport.findById(req.params.sport);
        if (sport == null) throw "sport";

        const student = Student.findById(req.params.student);
        if (student == null) throw "student";

        await mongo.model<PerformanceDocument>(sport.id).remove({ _id: req.params.id, student: student.id });

        res.redirect(303, `/private/sport/${req.params.sport}/${req.params.student}?gender=${req.filter.gender}&class=${req.filter.class}`);
    } catch (err) {
        if (err === "sport") {
            res.status(400).send("Cannot find sport. Try reloading the page!");
        } else if (err === "student") {
            res.status(400).send("Cannot find student. Try reloading the page!");
        } else {
            res.status(500).send("Something went wrong while trying to delete the performance. Try again!");
        }
    }
});

privateRouter.get("/new/sport", (req, res) => {
    if (req.auth.teacher) {
        res.render("private/new/sport", { csrfToken: req.csrfToken() });
    } else {
        res.status(403).render("public/auth/forbidden");
    }
});

privateRouter.post("/new/sport", async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render("public/auth/forbidden");
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

privateRouter.get("/new/performance/:sport?/:student?", async (req, res) => {
    //Fix duplicate selects
    if (!req.auth.teacher) {
        res.status(403).render("public/auth/forbidden");
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

        res.render("private/new/performance", {
            csrfToken: req.csrfToken(),
            sports: sports,
            students: students,
            sportSelected: sportSelected,
            studentSelected: studentSelected
        });
    } catch (err) {
        res.redirect(303, "/private/overview");
    }
});

privateRouter.post("/new/performance", async (req, res) => {
    if (!req.auth.teacher) {
        res.status(403).render("public/auth/forbidden");
        return;
    }

    try {
        const Performance = mongo.model(req.body.sport);

        const entry = new Performance({
            student: req.body.student,
            score: req.body.score,
            teacher: req.auth.id
        });

        await entry.save();

        res.redirect(303, `/private/sport/${req.body.sport}?gender=${req.filter.gender}&class=${req.filter.class}`);
    } catch (err) {
        switch (err.name) {
            case "MissingSchemaError":
                res.status(400).send("Cannot find specified sport. Try reloading the page!");
                break;

            case "ValidationError":
                res.status(400).send("Some input are not correct. See if you forgot anything!");
                break;

            default:
                res.status(500).send("Something went wrong while trying to save the performance. Try again!");
                break;
        }
    }
});

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;