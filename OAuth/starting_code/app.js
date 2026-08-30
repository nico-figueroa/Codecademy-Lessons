/* 
 * Package Imports
*/

const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session');
const passport = require('passport');
const app = express();
const GitHubStrategy = require('passport-github2').Strategy;

/*
 * Variable Declarations
*/

const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/*
 * Passport Configurations
*/

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
},
function verify(accessToken, refreshToken, profile, done) {
  if (!profile) {
    return done(new Error("No profile found"));
  }
  if (!accessToken) {
    return done(new Error("No access token found"));
  }
  if (!refreshToken) {
    return done(new Error("No refresh token found"));
  }
  if (!profile.id) {
    return done(new Error("No profile ID found"));
  }
  if (err) {
    return done(err);
  }
  return done(null, profile);
}
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}





/*
 *  Express Project Setup
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'codecademy',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/*
 * Routes
*/

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });




/*
 * Listener
*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
 * ensureAuthenticated Callback Function
*/

