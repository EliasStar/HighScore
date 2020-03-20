import express from 'express';
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {
        view: 'overview',
        sports: [
            {
                name: '100m',
                score: '5.5s'
            },
            {
                name: '400m',
                score: '9.34s'
            },
            {
                name: 'Seil springen',
                score: '10000x'
            }
        ],
        teacher: false,
        classes: []
    });
});

export default router;