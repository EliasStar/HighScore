import express from 'express';
import mongo from 'mongoose';

import Sport from "../models/sport";
import { getClasses } from '../models/student';

const router = express.Router();

router.get('/', async (req, res, nxt) => {
    if (!req.auth.authenticated) {
        res.status(401).render('index', {
            currentContainer: 'public/auth/unauthorized',
            teacher: false
        });
        return;
    }

    const sports = await Sport.find().exec();

    // sports.forEach(sport => {
    //     mongo.model(sport.id);
    // });


    if (req.auth.teacher) {
        res.render('index', {
            currentContainer: 'private/overview',
            sports: sports,
            teacher: true,
            classes: getClasses()
        });
    } else {
        res.render('index', {
            currentContainer: 'private/overview',
            sports: sports,
            teacher: false
        });
    }
});

export default router;