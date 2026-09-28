const Database = require("better-sqlite3");
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const validator = require("express-validator");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");

const { check, validationResult } = validator;

const db = new Database("./bank_sample.db");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname, "public")));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com",
          "https://fonts.googleapis.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    },
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
    response.status(403).send("The CSRF token is invalid");
    return;
  }
  next();
});

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const transferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

const forumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "html", "login.html"));
});

// LOGIN SQL + validation + bcrypt
app.post(
  "/auth",
  authLimiter,
  [
    check("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters."),
    check("password")
      .isLength({ min: 8, max: 100 })
      .withMessage("Password must be between 8 and 100 characters.")
  ],
  async function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).send(errors.array()[0].msg);
    }

    const username = request.body.username;
    const password = request.body.password;

    // Query only by username now
    const stmt = db.prepare(`SELECT * FROM users WHERE username = ?`);
    const results = stmt.get(username);

    if (!results) {
      return response.send("Incorrect Username and/or Password!");
    }

    // Compare bcrypt hash
    const match = await bcrypt.compare(password, results.password);
    if (!match) {
      return response.send("Incorrect Username and/or Password!");
    }

    request.session.loggedin = true;
    request.session.username = results.username;
    request.session.balance = results.balance;
    request.session.file_history = results.file_history;
    request.session.account_no = results.account_no;

    return response.redirect("/home");
  }
);

// Home Menu
app.get("/home", function (request, response) {
  const username = request.session.username;
  const balance = request.session.balance;
  if (request.session.loggedin) {
    response.render("home_page", { username, balance });
  } else {
    response.redirect("/");
  }
});

// Transfer GET
app.get("/transfer", csrfMiddleware, function (request, response) {
  if (request.session.loggedin) {
    response.render("transfer", { sent: "", csrfToken: request.csrfToken() });
  } else {
    response.redirect("/");
  }
});

// Transfer POST + validation
app.post(
  "/transfer",
  csrfMiddleware,
  transferLimiter,
  [
    check("account_to")
      .isInt({ min: 1 })
      .withMessage("Destination account must be a positive integer."),
    check("amount")
      .isInt({ min: 1 })
      .withMessage("Amount must be a positive integer.")
  ],
  function (request, response) {
    if (!request.session.loggedin) {
      return response.redirect("/");
    }

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.render("transfer", {
        sent: errors.array()[0].msg,
        csrfToken: request.csrfToken()
      });
    }

    const balance = request.session.balance;
    const account_to = parseInt(request.body.account_to, 10);
    const amount = parseInt(request.body.amount, 10);
    const account_from = request.session.account_no;

    if (balance > amount) {
      db.prepare(
        `UPDATE users SET balance = balance + ? WHERE account_no = ?`
      ).run(amount, account_to);

      db.prepare(
        `UPDATE users SET balance = balance - ? WHERE account_no = ?`
      ).run(amount, account_from);

      return response.render("transfer", {
        sent: "Money Transfered",
        csrfToken: request.csrfToken()
      });
    }

    return response.render("transfer", {
      sent: "You Don't Have Enough Funds.",
      csrfToken: request.csrfToken()
    });
  }
);

// Download GET
app.get("/download", csrfMiddleware, function (request, response) {
  if (request.session.loggedin) {
    const file_name = request.session.file_history;
    response.render("download", { file_name, csrfToken: request.csrfToken() });
  } else {
    response.redirect("/");
  }
});

// Download POST (safe)
app.post("/download", csrfMiddleware, function (request, response) {
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

// Public Forum GET
app.get("/public_forum", csrfMiddleware, function (request, response) {
  if (request.session.loggedin) {
    const rows = db.prepare(`SELECT username, message FROM public_forum`).all();
    response.render("forum", { rows, csrfToken: request.csrfToken() });
  } else {
    response.redirect("/");
  }
});

// Public Forum POST (validation + rate limit)
app.post(
  "/public_forum",
  csrfMiddleware,
  forumLimiter,
  [
    check("comment")
      .trim()
      .escape()
      .isLength({ min: 1, max: 300 })
      .withMessage("Comment must be between 1 and 300 characters.")
  ],
  function (request, response) {
    if (!request.session.loggedin) {
      return response.redirect("/");
    }

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      const rows = db.prepare(`SELECT username, message FROM public_forum`).all();
      return response.render("forum", {
        rows,
        csrfToken: request.csrfToken(),
        error: errors.array()[0].msg
      });
    }

    const comment = request.body.comment;
    const username = request.session.username;

    db.prepare(
      `INSERT INTO public_forum (username, message) VALUES (?, ?)`
    ).run(username, comment);

    const rows = db.prepare(`SELECT username, message FROM public_forum`).all();
    return response.render("forum", { rows, csrfToken: request.csrfToken() });
  }
);

// Public Ledger GET + validation
app.get(
  "/public_ledger",
  csrfMiddleware,
  [
    check("id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("ID must be a positive integer.")
  ],
  function (request, response) {
    if (!request.session.loggedin) {
      return response.redirect("/");
    }

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      const rowsAll = db.prepare(`SELECT * FROM public_ledger`).all();
      return response.render("ledger", {
        rows: rowsAll,
        csrfToken: request.csrfToken(),
        error: errors.array()[0].msg
      });
    }

    const idRaw = request.query.id;
    let rows;

    if (idRaw) {
      const id = parseInt(idRaw, 10);
      rows = db
        .prepare(`SELECT * FROM public_ledger WHERE from_account = ?`)
        .all(id);
    } else {
      rows = db.prepare(`SELECT * FROM public_ledger`).all();
    }

    return response.render("ledger", { rows, csrfToken: request.csrfToken() });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});