require("dotenv").config();

const express = require("express");
const Sequelize = require("sequelize");
const { FOREIGNKEYS } = require("sequelize/lib/query-types");

const app = express();

app.use(express.json());

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./Database/SQLMovies_reviews.sqlite",
});
const movie = sequelize.define("movies", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  movie_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  categoryID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    FOREIGNKEYS: true,
  },
  studioID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    FOREIGNKEYS: true,
  },
  movie_detail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  director: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  flimmaking_funds: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  movie_income: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

sequelize.sync();
app.get("/movies", (req, res) => {
    movie.findAll()
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/movies/:id", (req, res) => {
    movie.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        res.json(movie);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/movies", (req, res) => {
    movie.create(req.body)
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.put("/movies/:id", (req, res) => {
    movie.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        movie
          .update(req.body)
          .then(() => {
            res.send(movie);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// route to delete a book
app.delete("/movies/:id", (req, res) => {
    movie.findByPk(req.params.id)
    .then((movie) => {
      if (!movie) {
        res.status(404).send("Movie not found");
      } else {
        movie
          .destroy()
          .then(() => {
            res.send({});
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

const port = process.env.PROT || 3000;
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);