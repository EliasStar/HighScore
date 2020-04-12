import express from 'express';
const router = express.Router();

router.get('/', (req, res, nxt) => {

    if (!req.authenticated) {
        res.status(401).render('index', {
            currentContainer: 'public/login',
            teacher: false,
            classes: []
        });
        return;
    }

    let sports = [
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
    ];

    let classes: string[] = [];
    if (req.teacher) {
        //Get classes
        classes = ["7N", "8N", "5N1", "5N3"];
    }

    res.render('index', {
        currentContainer: 'private/overview',
        sports: sports,
        teacher: req.teacher,
        classes: classes
    });
});

export default router;