import express from 'express';
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', { classes: ['1E', '2E', '5N', '6N', '7N'] });
});

export default router;