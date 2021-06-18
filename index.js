const express = require('express');
const morgan = require('morgan');
const app = express();

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
