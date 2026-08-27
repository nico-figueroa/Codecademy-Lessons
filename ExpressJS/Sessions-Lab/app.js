const express = require("express");
const app = express();
const session = require("express-session");
const store = new session.MemoryStore();
const db = require("./db");
const products = require("./db/products");
const PORT = process.env.PORT || 4001;
const { exec } = require('child_process');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));

app.use(
  session({
    secret: "f4z4gs$Gcg",
    cookie: { maxAge: 300000000, secure: false },
    saveUninitialized: false,
    resave: false,
    store,
  })
);

// Middleware to ensure authentication
function ensureAuthentication(req, res, next) {
  if (req.session.authenticated) {
    return next();
  } else {
    res.status(403).json({ msg: "You're not authorized to view this page" });
  }
}

// Middleware to make the user object and cart count available in all views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  const cart = req.session?.cart || [];
  res.locals.cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  next();
});

// Add your ensureAuthentication middleware below:
app.get("/shop", ensureAuthentication, (req, res) => {
  // Send the user object and product list to the view page:
  res.render("shop", { user: req.session.user, products });
});

app.post("/cart/add/:id", ensureAuthentication, (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ msg: "Product not found" });

  if (!req.session.cart) req.session.cart = [];
  const existingItem = req.session.cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    req.session.cart.push({ id, qty: 1 });
  }
  res.redirect("/shop");
});

app.get("/cart", ensureAuthentication, (req, res) => {
  const cart = req.session.cart || [];
  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      return { ...product, qty: item.qty, subtotal: product.price * item.qty };
    })
    .filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  res.render("cart", { user: req.session.user, items, total });
});

app.post("/cart/checkout", ensureAuthentication, (req, res) => {
  req.session.cart = [];
  res.redirect("/shop");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: "Failed to log out" });
    res.redirect("/index");
  });
});

app.get("/profile", ensureAuthentication, (req, res) => {
  res.render("profile", { user: req.session.user });
});

// POST request for logging in
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.users.findByUsername(username, (err, user) => {
    if (!user) return res.status(403).json({ msg: "No user found!" });
    if (user.password === password) {
      req.session.authenticated = true;
      req.session.user = {
        username,
        password,
      };
      res.redirect("/shop");
    } else {
      res.status(403).json({ msg: "Bad Credentials" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  exec(`start msedge --app=http://localhost:${PORT}/index`);
});