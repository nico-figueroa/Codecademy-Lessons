const BetterSqlite3 = require('better-sqlite3');

const DB_ADDR = ":memory:";

const users = [
    {
        username: "1lameuser",
        password: "secret_password"
    },
    {
        username: "cool_user_87",
        password: "notPassword!"
    },
];

const initDB = () => {
    const db = new BetterSqlite3(DB_ADDR);
    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

        const insertStmt = db.prepare("INSERT INTO users(username,password) VALUES (?,?)");
        users.forEach(({ username, password}, i) => {
            insertStmt.run(username, password);
        });
        // insertStmt.finalize();
    // });
    return db;
};

module.exports = { initDB };
