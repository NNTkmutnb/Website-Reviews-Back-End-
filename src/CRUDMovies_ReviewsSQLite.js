const { request } = require("express");

const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();

// connect to DB
const db = new sqlite3.Database('./Database/Movies_reviews.sqlite');

// parse incoming requests
app.use(express.json());

// สร้างตาราง Movies Reviews
db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    movie_name VARCHAR(255),
    categoryID INTEGER,
    studioID INTEGER,
    movie_detail TEXT,
    director TEXT,
    flimmaking_funds TEXT,
    movie_income TEXT,
    FOREIGN KEY (categoryID) REFERENCES category(id),
    FOREIGN KEY (studioID) REFERENCES studio(id)
)`);

// สร้างตาราง Review
db.run(`CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY,
    movieID INTEGER,
    review_detail TEXT,
    overall_score INTEGER,
    reviewer VARCHAR(255),
    FOREIGN KEY (movieID) REFERENCES movies(id)
)`);

// สร้างตาราง Category
db.run(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    detail TEXT
)`);

// สร้างตาราง Studio
db.run(`CREATE TABLE IF NOT EXISTS studio (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    detail TEXT
)`);

// Get a movies, studio_name
app.get('/movies_reviews', (req, res) => {
    db.all('SELECT movies.id, movies.movie_name, studio.name FROM studio JOIN movies ON studio.id = movies.studioID', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// CRUD For Movies
app.get('/movies', (req, res) => {
    db.all('SELECT * FROM movies', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// route to get a movies by id
app.get('/movies/:id', (req, res) => {
    db.get('SELECT * FROM movies WHERE id = ?', req.params.id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (!row) {
                res.status(404).send('Movies not found');
            } else {
                res.json(row);
            }
        }
    });
});

// route to creata a new movies
app.post('/movies', (req, res) => {
    const movie = req.body;
    db.run('INSERT INTO movies (movie_name, categoryID, studioID, movie_detail, director, flimmaking_funds, movie_income) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            movie.movie_name, movie.categoryID, movie.studioID, movie.movie_detail, movie.director, movie.flimmaking_funds, movie.movie_income, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(movie);
        }
    });
});

// route to update a movies
app.put('/movies/:id', (req, res) => {
    const movie = req.body;
    db.run('UPDATE movies SET movie_name = ?, categoryID = ?, studioID = ?, movie_detail = ?, director = ?, flimmaking_funds = ?, movie_income = ? WHERE id = ?', 
        movie.movie_name, movie.categoryID, movie.studioID, movie.movie_detail, movie.director, movie.flimmaking_funds, movie.movie_income, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(movie);
        }
    });  
});

// route to delete a movies
app.delete('/movies/:id', (req, res) => {
    db.run('DELETE FROM movies WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({});
        }
    });
});

// Get a movie_detail & reviews
app.get('/movie_detail&review/:id', (req, res) => {
    db.get(`SELECT 
            movies.movie_name,
            category.name AS category_name,
            studio.name AS studio_name,
            movies.movie_detail, 
            movies.director,
            movies.flimmaking_funds, 
            movies.movie_income, 
            review.reviewer, 
            review.review_detail, 
            review.overall_score
            FROM movies 
            JOIN review ON movies.id = review.movieID
            JOIN category ON movies.categoryID = category.id
            JOIN studio ON movies.studioID = studio.id
            WHERE movies.id = ?`, req.params.id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (!row) {
                res.status(404).send('Movies not found');
            } else {
                res.json(row);
            }
        }
    });
});

// CRUD For Review
app.get('/review', (req, res) => {
    db.all('SELECT * FROM review', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// route to get a review by id
app.get('/review/:id', (req, res) => {
    db.get('SELECT * FROM review WHERE id = ?', req.params.id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (!row) {
                res.status(404).send('review not found');
            } else {
                res.json(row);
            }
        }
    });
});

// route to create a new review
app.post('/review', (req, res) => {
    const review = req.body;
    db.run('INSERT INTO review (movieID, review_detail, overall_score, reviewer) VALUES (?, ?, ?, ?)', 
            review.movieID, review.review_detail, review.overall_score, review.reviewer, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(review);
        }
    });
});

// route to update a review
app.put('/review/:id', (req, res) => {
    const review = req.body;
    db.run('UPDATE review SET movieID = ?, review_detail = ?, overall_score = ?, reviewer = ? WHERE id = ?', 
        review.movieID, review.review_detail, review.overall_score, review.reviewer, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(review);
        }
    });  
});

// route to delete a review
app.delete('/review/:id', (req, res) => {
    db.run('DELETE FROM review WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({});
        }
    });
});

// CRUD For Category
app.get('/category', (req, res) => {
    db.all('SELECT * FROM category', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// route to get a category by id
app.get('/category/:id', (req, res) => {
    db.get('SELECT * FROM category WHERE id = ?', req.params.id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (!row) {
                res.status(404).send('category not found');
            } else {
                res.json(row);
            }
        }
    });
});

// route to creata a new category
app.post('/category', (req, res) => {
    const category = req.body;
    db.run('INSERT INTO category (name, detail) VALUES (?, ?)', 
            category.name, category.detail, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(category);
        }
    });
});

// route to update a category
app.put('/category/:id', (req, res) => {
    const category = req.body;
    db.run('UPDATE category SET name = ?, detail = ? WHERE id = ?', 
            category.name, category.detail, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(category);
        }
    });  
});

// route to delete a category
app.delete('/category/:id', (req, res) => {
    db.run('DELETE FROM category WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({});
        }
    });
});

// CRUD For Studio
app.get('/studio', (req, res) => {
    db.all('SELECT * FROM studio', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// route to get a studio by id
app.get('/studio/:id', (req, res) => {
    db.get('SELECT * FROM studio WHERE id = ?', req.params.id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (!row) {
                res.status(404).send('studio not found');
            } else {
                res.json(row);
            }
        }
    });
});

// route to creata a new studio
app.post('/studio', (req, res) => {
    const studio = req.body;
    db.run('INSERT INTO studio (name, detail) VALUES (?, ?)', 
            studio.name, studio.detail, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(studio);
        }
    });
});

// route to update a studio
app.put('/studio/:id', (req, res) => {
    const studio = req.body;
    db.run('UPDATE studio SET name = ?, detail = ? WHERE id = ?', 
        studio.name, studio.detail, req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(studio);
        }
    });  
});

// route to delete a studio
app.delete('/studio/:id', (req, res) => {
    db.run('DELETE FROM studio WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({});
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))
