import express from 'express';
const privateRouter = express.Router();

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

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;