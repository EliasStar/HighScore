import express from 'express';
const privateRouter = express.Router();

privateRouter.use((req, res) => {
    res.status(404).end();
});

export default privateRouter;