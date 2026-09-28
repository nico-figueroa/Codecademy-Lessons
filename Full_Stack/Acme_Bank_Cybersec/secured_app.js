const Database = require("better-sqlite3");
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const validator = require("express-validator");

const db = new Database("./bank_sample.db");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname, "public")));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 30000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const csrfMiddleware = csurf({
  cookie: {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
});

app.use((error, request, response, next) => {
  if (error.code === "EBADCSRFTOKEN") {
    response.status(403).send("Invalid CSRF token");
    return;
  }
  next();
});

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "html", "login.html"));
});

// LOGIN
app.post("/auth", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  if (!username || !password) {
    return response.send("Please enter Username and Password!");
  }

  const stmt = db.prepare(
    `SELECT * FROM users WHERE username = ? AND password = ?`
  );
  const results = stmt.get(username, password);

  if (!results) {
    return response.send("Incorrect Username and/or Password!");
  }

  request.session.loggedin = true;
  request.session.username = results.username;
  request.session.balance = results.balance;
  request.session.file_history = results.file_history;
  request.session.account_no = results.account_no;

  return response.redirect("/home");
});

// HOME
app.get("/home", (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const username = request.session.username;
  const balance = request.session.balance;

  return response.render("home_page", { username, balance });
});

// TRANSFER GET
app.get("/transfer", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  return response.render("transfer", {
    sent: "",
    csrfToken: request.csrfToken()
  });
});

// TRANSFER POST
app.post("/transfer", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const balance = request.session.balance;
  const account_to = parseInt(request.body.account_to);
  const amount = parseInt(request.body.amount);
  const account_from = request.session.account_no;

  if (!account_to || !amount) {
    return response.render("transfer", {
      sent: "",
      csrfToken: request.csrfToken()
    });
  }

  if (balance <= amount) {
    return response.render("transfer", {
      sent: "You Don't Have Enough Funds.",
      csrfToken: request.csrfToken()
    });
  }

  db.prepare(
    `UPDATE users SET balance = balance + ? WHERE account_no = ?`
  ).run(amount, account_to);

  db.prepare(
    `UPDATE users SET balance = balance - ? WHERE account_no = ?`
  ).run(amount, account_from);

  return response.render("transfer", {
    sent: "Money Transferred",
    csrfToken: request.csrfToken()
  });
});

// DOWNLOAD GET
app.get("/download", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const file_name = request.session.file_history;

  return response.render("download", {
    file_name,
    csrfToken: request.csrfToken()
  });
});

// DOWNLOAD POST (safe)
app.post("/download", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const file_name = path.basename(request.body.file);
  const baseDir = path.join(__dirname, "history_files");
  const filePath = path.join(baseDir, file_name);

  if (!filePath.startsWith(baseDir)) {
    return response.status(400).send("Invalid file path");
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return response.type("text/plain").send(content);
  } catch (err) {
    console.log(err);
    return response.status(404).send("File not found");
  }
});

// PUBLIC FORUM GET
app.get("/public_forum", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const rows = db.prepare(`SELECT username, message FROM public_forum`).all();

  return response.render("forum", {
    rows,
    csrfToken: request.csrfToken()
  });
});

// PUBLIC FORUM POST
app.post("/public_forum", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const comment = validator.escape(request.body.comment);
  const username = request.session.username;

  if (comment) {
    db.prepare(
      `INSERT INTO public_forum (username, message) VALUES (?, ?)`
    ).run(username, comment);
  }

  const rows = db.prepare(`SELECT username, message FROM public_forum`).all();

  return response.render("forum", {
    rows,
    csrfToken: request.csrfToken()
  });
});

// PUBLIC LEDGER
app.get("/public_ledger", csrfMiddleware, (request, response) => {
  if (!request.session.loggedin) {
    return response.redirect("/");
  }

  const id = request.query.id;

  const rows = id
    ? db.prepare(`SELECT * FROM public_ledger WHERE from_account = ?`).all(id)
    : db.prepare(`SELECT * FROM public_ledger`).all();

  return response.render("ledger", {
    rows,
    csrfToken: request.csrfToken()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
