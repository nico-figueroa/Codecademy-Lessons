import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import pool from './db.js';
import indexRouter from './routes/index';
import usersRouter from './routes/users';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;

pool.connect()
  .then(async client => {
    try {
      await client
        .query('SELECT NOW()');
      client.release();
      console.log('Database connection established');
    } catch (err_1) {
      client.release();
      console.error('Database connection error', err_1);
    }
  });

app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce App!');
});

app.post('/', (req, res) => {
  res.send('Got a POST request');
});

app.put('/users', (req, res) => {
  res.send('Got a PUT request at /users');
});

app.delete('/users', (req, res) => {
  res.send('Got a DELETE request at /users');
});