const express = require('express');
const app = express();

module.exports = app;

// Add middleware for handling CORS requests from index.html
const cors = require('cors');

// Add middware for parsing request bodies here:
app.use(express.json());

// Mount your existing apiRouter below at the '/api' path.
const apiRouter = require('./server/api');

app.use(cors());
app.use('/api', apiRouter);