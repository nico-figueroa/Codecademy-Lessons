const express = require('express');
const bodyParser = require('body-parser');
const { initDB } = require('./db');

const app = express();
app.use(bodyParser.json());

// initDB should return a better-sqlite3 Database instance
const db = initDB();

// GET all users
app.get("/users", (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM users");
        const rows = stmt.all();
        res.json({ users: rows });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// GET user by ID
app.get("/users/:id", (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
        const user = stmt.get(req.params.id);

        if (!user) {
            res.json({ user: {} });
        } else {
            res.json({ user });
        }
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// POST create user
app.post("/users", (req, res) => {
    try {
        const { user: { username, password } } = req.body;

        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        const result = stmt.run(username, password);

        res.json({
            id: result.lastInsertRowid,
            username,
            password
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE user by ID
app.put("/users/:id", (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body.user;

        const stmt = db.prepare(`
            UPDATE users
            SET username = ?, password = ?
            WHERE id = ?
        `);

        const result = stmt.run(username, password, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id,
            username,
            password
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE user by ID
app.delete("/users/:id", (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare("DELETE FROM users WHERE id = ?");
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

app.listen(4000, () => console.log("Simple server running on http://localhost:4000"));
