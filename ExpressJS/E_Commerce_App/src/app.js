import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';
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
const directory = path.dirname(fileURLToPath(import.meta.url));
const openApiDocument = JSON.parse(
  fs.readFileSync(path.join(directory, '..', 'openapi.ecommerce.v1.json'), 'utf8')
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'Mercantile API Documentation'
}));

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