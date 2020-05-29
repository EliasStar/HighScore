import express from "express";
const publicRouter = express.Router();

publicRouter.get("/about", (req, res) => {
    res.render("public/about");
});

publicRouter.get("/help", (req, res) => {
    res.render("public/help");
});

publicRouter.use((req, res) => {
    res.status(404).end();
});

export default publicRouter;