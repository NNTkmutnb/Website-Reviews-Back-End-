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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_name VARCHAR(255) NOT NULL,
    categoryID INTEGER NOT NULL,
    studioID INTEGER NOT NULL,
    movie_detail TEXT NOT NULL,
    director TEXT NOT NULL,
    flimmaking_funds TEXT NOT NULL,
    movie_income TEXT NOT NULL,
    FOREIGN KEY (categoryID) REFERENCES category(id),
    FOREIGN KEY (studioID) REFERENCES studio(id)
)`);

// สร้างตาราง Review
db.run(`CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movieID INTEGER NOT NULL,
    review_detail TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    reviewer VARCHAR(255) NOT NULL,
    FOREIGN KEY (movieID) REFERENCES movies(id)
)`);

// สร้างตาราง Category
db.run(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL
)`);

// สร้างตาราง Studio
db.run(`CREATE TABLE IF NOT EXISTS studio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL
)`);

// CRUD For Movies
app.get('/movies', (req, res) => {
    db.all(`SELECT movies.id,
            movies.movie_name,
            category.name AS category_name,
            studio.name AS studio_name,
            movies.movie_detail, 
            movies.director,
            movies.flimmaking_funds, 
            movies.movie_income
            FROM movies 
            JOIN category ON movies.categoryID = category.id
            JOIN studio ON movies.studioID = studio.id`, (err, row) => {
        // db.all(`SELECT * FROM movies`, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(row);
        }
    });
});

// route to get a movies by id
app.get('/movies/:id', (req, res) => {
    db.get(`SELECT movies.id,
            movies.movie_name,
            category.name AS category_name,
            studio.name AS studio_name,
            movies.movie_detail, 
            movies.director,
            movies.flimmaking_funds, 
            movies.movie_income
            FROM movies 
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

// route to creata a new movies
app.post('/movies', (req, res) => {
    const movie = req.body;
    db.run(`INSERT INTO movies (movie_name, categoryID, studioID, movie_detail, director, flimmaking_funds, movie_income) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
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

// CRUD For Review
app.get('/review', (req, res) => {
    db.all(`SELECT * FROM review`, (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// route to get a review by id
app.get('/review/:movieID', (req, res) => {
    const movieID = req.params.movieID; // รับ movieID จาก URL
    const sql = 'SELECT * FROM review WHERE movieID = ?';

    db.all(sql, [movieID], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // ส่งข้อมูลที่ดึงมาในรูปแบบ JSON
    });
});

app.get('/review_id/:id', (req, res) => {
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

// route to delete reviews by movieID
app.delete('/review_movies/:movieID', (req, res) => {
    const movieID = req.params.movieID;
    const sql = 'DELETE FROM review WHERE movieID = ?';

    db.run(sql, [movieID], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Reviews deleted' });
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

// route to get id and name form category for selection
app.get('/category_select', (req, res) => {
    db.all("SELECT id, name FROM category", (err, row) => {
        if (err) {
            console.error('Error retrieving categories:', err.message);
            res.status(500).send('Error retrieving categories');
        } else {
            res.json(row); // ส่งข้อมูล category กลับไปยัง Front-End
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
