const express = require('express');
const { bios } = require('../data-bios');
const { getRandomElement } = require('../utils');

const biosRouter = express.Router();

// Utility function to sanitize text input by removing HTML tags, control characters, and trimming whitespace
const sanitizeText = value => value
  .replace(/<[^>]*>/g, '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim();

// Utility function to validate and sanitize bio data, ensuring required fields are present and correctly formatted
const validateBio = body => {
  if (!body || typeof body.person !== 'string' || typeof body.bio !== 'string') {
    return null;
  }

  const person = sanitizeText(body.person);
  const bio = sanitizeText(body.bio);
  const birthYear = Number(body.birthYear);
  if (!person || !bio || person.length > 100 || bio.length > 1000 ||
      !Number.isInteger(birthYear) || birthYear < 1 || birthYear > new Date().getFullYear()) {
    return null;
  }

  return { person, birthYear, bio };
};

// Route to get all bios, optionally filtered by person name
biosRouter.get('/', (req, res) => {
  const person = typeof req.query.person === 'string' ? req.query.person.trim().toLowerCase() : '';
  const filteredBios = person
    ? bios.filter(bio => bio.person.toLowerCase().includes(person)) // Using includes allows partial matches for the person name
    : bios;
  res.json({ bios: filteredBios });
});

// Route to get a random bio
biosRouter.get('/random', (req, res) => {
  res.json({ bio: getRandomElement(bios) });
});

// Route to get a bio by its ID
biosRouter.get('/:id', (req, res) => {
  const bio = bios.find(item => item.id === Number(req.params.id));
  if (!bio) {
    return res.status(404).json({ error: 'Biography not found' });
  }
  res.json({ bio });
});

// Route to create a new bio
biosRouter.post('/', (req, res) => {
  const bioData = validateBio(req.body);
  if (!bioData) {
    return res.status(400).json({ error: 'Person, biography, and a valid birth year are required' });
  }

  const newBio = { id: bios.length ? Math.max(...bios.map(bio => bio.id)) + 1 : 1, ...bioData };
  bios.push(newBio);
  res.status(201).json({ bio: newBio });
});

// Route to update an existing bio by its ID
biosRouter.put('/:id', (req, res) => {
  const bioIndex = bios.findIndex(bio => bio.id === Number(req.params.id));
  const bioData = validateBio(req.body);
  if (!bioData) {
    return res.status(400).json({ error: 'Person, biography, and a valid birth year are required' });
  }
  if (bioIndex === -1) {
    return res.status(404).json({ error: 'Biography not found' });
  }

  const updatedBio = { id: bios[bioIndex].id, ...bioData };
  bios[bioIndex] = updatedBio;
  res.json({ bio: updatedBio });
});

// Route to delete a bio by its ID
biosRouter.delete('/:id', (req, res) => {
  const bioIndex = bios.findIndex(bio => bio.id === Number(req.params.id));
  if (bioIndex === -1) {
    return res.status(404).json({ error: 'Biography not found' });
  }

  const deletedBio = bios.splice(bioIndex, 1)[0];
  res.json({ bio: deletedBio });
});

module.exports = biosRouter;