import express from 'express';
const privateRouter = express.Router();

privateRouter.use((req, res, nxt) => {
    if (req.authenticated) {
        nxt();
    } else {
        res.status(401).render("public/auth/unauthorized");
    }
});

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

privateRouter.get('/new/sport', (req, res) => {
    if (req.teacher) {
        res.render('private/new/sport', { csrfToken: req.csrfToken() });
    } else {
        res.status(403).render('public/auth/forbidden');
    }
});

privateRouter.post('/new/sport', (req, res) => {
    //res.redirect(`private/sport/${sport.id}`);
    //res.redirect(`private/overview`);
    //res.redirect(`private/new/sport`);
});

privateRouter.get('/sport/:id', (req, res) => {
    res.render('private/sport', {

    });
});

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;