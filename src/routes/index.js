const { Router } = require("express");

const usersRouter = require("./users.routes");
const movieNotesRouter = require("./movienotes.routes");
const movieTagsRouter = require("./movietags.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/movienotes", movieNotesRouter);
routes.use("/movietags", movieTagsRouter);

module.exports = routes;
