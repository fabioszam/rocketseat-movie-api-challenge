const { Router } = require("express");

const MovieNotesController = require("../controllers/MovieNotesController");

const movieNotesRouter = Router();

const movieNotesController = new MovieNotesController();

movieNotesRouter.get("/", movieNotesController.index);
movieNotesRouter.post("/:user_id", movieNotesController.create);
movieNotesRouter.get("/:id", movieNotesController.show);
movieNotesRouter.delete("/:id", movieNotesController.delete);

module.exports = movieNotesRouter;
