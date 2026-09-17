import express from 'express'
import * as db from './queries.js'
import cors from 'cors'
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Passport.js local strategy for authentication
passport.use(new LocalStrategy(async (username, password) => {
  // Verify username and password
  const user = await db.findUserByCredentials(username, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  return user;
}));

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Permission denied' });
    }
}

// Initialize Express application
const app = express()
const port = 3000

// Apply security-related HTTP headers using Helmet
app.use(helmet());
// Enable CORS for cross-origin requests
app.use(cors())
// Parse incoming request bodies as JSON and URL-encoded data
app.use(express.json())
// Apply rate limiting to all requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(apiLimiter);

// Error-handling middleware for catching and responding to errors
// This should be placed after all other middleware and routes
app.use(
  express.urlencoded({
    extended: true,
  })
)
// Catch-all error handler for any unhandled errors in the request pipeline
app.use((req, res, next) => {
    const error = new Error('Something went wrong');
    next(error);
});

// Define API routes for user management
app.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and PostgreSQL API' })
})

// User management routes
app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

// Error-handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Internal Server Error');
});