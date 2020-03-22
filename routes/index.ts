import express from 'express';
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', {
        currentContainer: 'overview',
        csrfToken: req.csrfToken(),
        sports: [
            {
                id: '100m',
                name: '100m Sprint',
                score: '5.5',
                unitSymbol: 's'
            },
            {
                id: '400m',
                name: '400m Sprint',
                score: '9.34',
                unitSymbol: 's'
            },
            {
                id: 'RopeSkipping',
                name: 'Seil springen',
                score: '10000',
                unitSymbol: 'x'
            }
        ],
        teacher: false,
        classes: []
    });
});

export default router;