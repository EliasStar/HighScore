import express from 'express';
const router = express.Router();

router.get('/overview', (req, res, next) => {
    res.render('overview', {
        csrfToken: req.csrfToken(),
        sports: [
            {
                id: '100m',
                name: '100m Sprint',
                score: '0',
                unitSymbol: 's'
            },
            {
                id: '400m',
                name: '400m Sprint',
                score: '0',
                unitSymbol: 's'
            },
            {
                id: 'RopeSkipping',
                name: 'Seil springen',
                score: '0',
                unitSymbol: 'x'
            }
        ]
    });
});

router.get('/sport', (req, res, next) => {
    res.render('sport', {
        csrfToken: req.csrfToken(),
        sport: {
            name: req.query.sport,
            unit: 'Zeit',
            unitSymbol: 's'
        },
        scores: [
            '3',
            '5',
            '14',
            '23'
        ]
    });
});

router.use((req, res, next) => {
    res.status(404).end();
});

export default router;