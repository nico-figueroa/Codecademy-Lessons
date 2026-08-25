const express = require('express');
const { quotes } = require('../data');
const { getRandomElement } = require('../utils');

const quotesRouter = express.Router();

// Utility function to sanitize and validate quote data
const sanitizeText = value => value
  .replace(/<[^>]*>/g, '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim();

// Utility function to validate the structure and content of a quote object from the request body
const validateQuote = body => {
  if (!body || typeof body.quote !== 'string' || typeof body.person !== 'string') {
    return null;
  }

  const quote = sanitizeText(body.quote);
  const person = sanitizeText(body.person);
  const year = Number(body.year);
  if (!quote || !person || quote.length > 500 || person.length > 100 ||
      !Number.isInteger(year) || year < 1 || year > new Date().getFullYear()) {
    return null; // Return null if any validation check fails, indicating invalid quote data
  }

  return { quote, person, year };
};

// Route to get a random quote
quotesRouter.get('/random', (req, res) => {
  res.json({ quote: getRandomElement(quotes) });
});

// Route to get all quotes or filter by person
quotesRouter.get('/', (req, res) => {
  const person = typeof req.query.person === 'string' ? req.query.person.trim().toLowerCase() : '';
  const filteredQuotes = person
    ? quotes.filter(quote => quote.person.toLowerCase().includes(person)) // Use of includes allows partial matching of the person's name in the query
    : quotes;
  res.json({ quotes: filteredQuotes });
});

// Route to create a new quote
quotesRouter.post('/', (req, res) => {
  const quoteData = validateQuote(req.body);
  if (!quoteData) {
    return res.status(400).json({ error: 'Person, quote, and a valid year are required' });
  }

  const newQuote = { id: quotes.length ? Math.max(...quotes.map(quote => quote.id)) + 1 : 1, ...quoteData }; // Assign a unique ID to the new quote based on the current highest ID in the quotes array
  quotes.push(newQuote);
  res.status(201).json({ quote: newQuote });
});

// Route to update an existing quote by its ID
quotesRouter.put('/:id', (req, res) => {
  const quoteIndex = quotes.findIndex(quote => quote.id === Number(req.params.id));
  const quoteData = validateQuote(req.body);
  if (!quoteData) {
    return res.status(400).json({ error: 'Person, quote, and a valid year are required' });
  }
  if (quoteIndex === -1) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  const updatedQuote = { id: quotes[quoteIndex].id, ...quoteData };
  quotes[quoteIndex] = updatedQuote;
  res.json({ quote: updatedQuote });
});

// Route to delete a quote by its ID
quotesRouter.delete('/:id', (req, res) => {
  const quoteIndex = quotes.findIndex(quote => quote.id === Number(req.params.id));
  if (quoteIndex === -1) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  const deletedQuote = quotes.splice(quoteIndex, 1)[0];
  res.json({ quote: deletedQuote });
});

module.exports = quotesRouter;