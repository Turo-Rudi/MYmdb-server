const express = require('express');
const app = express();
const morgan = require('morgan');

// Logging with Morgan
app.use(morgan('common'));

let topMovies = [
  'The Shawshank Redemption',
  'The Godfather',
  'The Dark Knight',
  '12 Angry Men',
  'Schindler\'s List',
  'Pulp Fiction',
  'The Good, The Bad And The Ugly',
  'Fight Club',
  'Forrest Gump',
  'Inception',
  'Citizen Kane',
  'Rear Window',
  'Casablanca',
  'Boyhood',
  'Singin\' In The Rain'
]

// GET request
app.get('/', (req, res) => {
  res.send('Welcome to my top 10 Movie App!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/movies/:title', (req, res) => {
  res.json(topMovies.find((topMovies) => {
    return topMovies.title === req.params.title
  }));
});

app.get('/movies/genres/:genre', (req, res) => {
  res.send('Here comes the genres');
});

app.get('/movies/directors/:name', (req, res) => {
  res.send('Here comes the directors');
});

app.post('/users', (req, res) => {
  res.send('Your registration was successful!');
});

app.put('/users/:username', (req, res) => {
  res.send(req.params.username + 'Your profile update was successful!');
});

app.post('/users/:username/favorites', (req, res) => {
  res.send(req.params.title + ' was successfully added to your favorites!');
});

app.delete('/users/:username/favorites/:title', (req, res) => {
  res.send(req.params.title + ' was successfully removed from your favorites!');
});

app.delete('/users/:username', (req, res) => {
  res.send('You successfully deleted your account!');
});

app.get('/actors', (req, res) => {
  res.send('Here comes the actors');
});

app.get('/actors/:name', (req, res) => {
  res.send('Here comes the details about one actor');
});

app.get('/movies/:title', (req, res) => {
  res.send('More info on the movie');
});

app.post('/users/:username/favorites/watchlist', (req, res) => {
  res.send(req.params.title + ' was successfully added to your watchlist!');
});

app.delete('/users/:username/favorites/watchlist/:title', (req, res) => {
  res.send(req.params.title + ' was successfully removed from your watchlist!');
});

// Set static file
app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something is not working!');
});

app.listen(8080, () => {
  console.log('My app is listening to Port 8080')
});
