//imports
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const passport = require('passport');
require('./passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const Movies = Models.Movie;
const Users = Models.User;
const Actors = Models.Actor;
const Directors = Models.Director;
const Genres = Models.Genre;

let auth = require('./auth')(app);

// DB connection
//mongoose.connect('mongodb://localhost:27017/MYmdb', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Logging with Morgan
app.use(morgan('common'));

//Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to MYmdb App!');
});

//Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get movies by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get genre info by name
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.json(genre.Description);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get director info by name
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find().then((users) => {
    res.status(200).json(users);
  })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Add user with validaton checks
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username must contain only alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthday', 'Birthday must have a date format').isDate()
  ], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log(req.body)
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }).then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists.');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    }).catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });

//Get user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Updates user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthday', 'Birthday must have a date format').isDate()
  ], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true }, (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error: ' + error);
        } else {
          res.json(updatedUser);
        }
      });
  });

//Adds favorite movie to a user
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, (error, updatedUser) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      } else {
        res.json(updatedUser);
      }
    });
});

//Remove favorite movie from a user
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, (error, updatedUser) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      } else {
        res.json(updatedUser);
      }
    });
});

//Delete user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Get all actors
app.get('/actors', passport.authenticate('jwt', { session: false }), (req, res) => {
  Actors.find().then((actors) => {
    res.status(200).json(actors);
  })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get actor info by name
app.get('/actors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Actors.findOne({ Name: req.params.Name })
    .then((actor) => {
      res.json(actor);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Set static file
app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something is not working!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
