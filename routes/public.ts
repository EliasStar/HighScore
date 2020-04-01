import express from 'express';
const publicRouter = express.Router();

publicRouter.use((req, res) => {
    res.status(404).end();
});

export default publicRouter;