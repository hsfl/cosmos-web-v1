const express = require('express');

const app = express();
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all route exposing compiled React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', '/index.html'));
});

// Listen on specified port & notify
app.listen(8080, () => console.log('Listening on http://localhost:8080'));
