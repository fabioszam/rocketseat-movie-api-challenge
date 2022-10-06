const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class MovieNotesController {
  async create(req, res) {
    const { title, description, rating, tags } = req.body;
    const { user_id } = req.params;

    if (rating < 1 || rating > 5) {
      throw new AppError("Please insert a rating between 1 and 5.");
    }

    const database = await sqliteConnection();
    const checkMovieExists = await database.get(
      "SELECT * FROM movie_notes WHERE title = (?)",
      [title]
    );

    if (checkMovieExists) {
      throw new AppError("This movie is already registered.");
    }

    const note_id = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        user_id,
        name,
      };
    });

    await knex("movie_tags").insert(tagsInsert);

    res.json();
  }

  async show(req, res) {
    const { id } = req.params;

    const movieNote = await knex("movie_notes").where({ id }).first();
    const tags = await knex("movie_tags")
      .where({ note_id: id })
      .orderBy("name");

    return res.json({
      ...movieNote,
      tags,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex("movie_notes").where({ id }).delete();

    return res.json();
  }

  async index(req, res) {
    const { title, user_id, tags } = req.query;

    let movieNotes;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      movieNotes = await knex("movie_tags")
        .select(["movie_notes.id", "movie_notes.title", "movie_notes.user_id"])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("movie_notes.title");
    } else {
      movieNotes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({ user_id });
    const movieNotesWithTags = movieNotes.map((movieNote) => {
      const movieNoteTags = userTags.filter(
        (tag) => tag.note_id === movieNote.id
      );

      return {
        ...movieNote,
        tags: movieNoteTags,
      };
    });

    return res.json(movieNotesWithTags);
  }
}

module.exports = MovieNotesController;
