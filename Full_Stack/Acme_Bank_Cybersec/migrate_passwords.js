const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const fs = require("fs");

const db = new Database("./bank_sample.db");

// Load original passwords
const backup = JSON.parse(fs.readFileSync("./password_backup.json", "utf8"));

const users = db.prepare("SELECT username FROM users").all();

for (const user of users) {
  const originalPassword = backup[user.username];

  if (!originalPassword) {
    console.log(`Skipping ${user.username} — no backup password found`);
    continue;
  }

  const hash = bcrypt.hashSync(originalPassword, 12);

  db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hash, user.username);

  console.log(`Updated ${user.username}`);
}

console.log("Password migration complete.");
