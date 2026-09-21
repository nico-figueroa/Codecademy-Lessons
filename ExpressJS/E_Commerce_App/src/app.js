import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import pool from './db.js';

// ROUTES
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';

import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

// API routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);

// Error handling middleware
app.use(errorHandler);

// DB connection test
pool.connect()
  .then(async client => {
    try {
      await client.query('SELECT NOW()');
      client.release();
      console.log('Database connection established');
    } catch (err) {
      client.release();
      console.error('Database connection error', err);
    }
  });

export default app;