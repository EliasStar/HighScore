import express from "express";
import mongo from "mongoose";

import { getClasses } from '../api/list';

import Sport from "../models/sport";
import Student from "../models/student";
import { PerformanceDocument } from '../models/performance';

const router = express.Router();

router.get("/", async (req, res, nxt) => {
    if (!req.auth.authenticated) {
        res.status(401).render("index", {
            currentContainer: "public/auth/unauthorized",
            teacher: false
        });
        return;
    }

    res.render("index", {
        currentContainer: "private/overview",
        entries: await getOverviewEntries(req),
        teacher: req.auth.teacher,
        classes: req.auth.teacher ? getClasses() : undefined
    });
});

export async function getOverviewEntries(req: express.Request) {
    const sports = await Sport.find();

    return Promise.all(sports.map(async sport => {
        const Performance = mongo.model<PerformanceDocument>(sport.id);

        const students = req.auth.teacher ? Student.find(req.filter.gender, req.filter.class).map(student => student.id) : [req.auth.id || ""];

        const doc = await Performance.findOne({ student: { $in: students } }).sort({ score: "descending" });

        if (doc != null) return {
            sport: {
                id: sport._id,
                name: sport.name,
                unitSymbol: sport.unitSymbol
            },
            score: doc.score,
            student: Student.nameForID(students.filter(id => id === doc.student)[0]),
            filled: true
        }

        return {
            sport: {
                id: sport._id,
                name: sport.name
            },
            filled: false
        }
    }));
}

export default router;