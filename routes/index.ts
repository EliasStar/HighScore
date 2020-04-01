import express from 'express';
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', {
        currentContainer: 'private/overview',
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
        ],
        teacher: false,
        classes: []
    });
});

export default router;