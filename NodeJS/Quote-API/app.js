const express = require('express'); // import the Express library to create the server and handle routing
const cors = require('cors'); // import the CORS middleware to enable Cross-Origin Resource Sharing
const app = express(); // create an instance of an Express application to handle incoming requests and define routes
app.use(express.json()); // enable JSON parsing for incoming requests and make the parsed data available in req.body

const quotesRouter = require('./routers/quotesRouter');
const biosRouter = require('./routers/biosRouter');

app.use(cors()); // enable CORS for all routes, necessary for cross-origin request protection in case of external requests to this API
app.use(express.static('public')); // serve static files from the 'public' directory

// Set up API routes for quotes and bios
app.use('/api/quotes', quotesRouter); // use the quote router for '/api/quotes' routes, handling all quote-related API requests
app.use('/api/bios', biosRouter); // use the bio router for '/api/bios' routes, handling all bio-related API requests

// export app for use in main.js and for testing
module.exports = {
  app
};

