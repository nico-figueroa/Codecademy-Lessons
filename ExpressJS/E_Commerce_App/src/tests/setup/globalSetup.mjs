import dotenv from "dotenv";
import path from "path";

// Load .env.test AGAIN because globalSetup runs in a separate process
const envPath = path.join(process.cwd(), "src", "tests", "setup", ".env.test");
dotenv.config({ path: envPath });

console.log("🔧 globalSetup ENV:", {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DATABASE_URL: process.env.DATABASE_URL,
});

export default async function () {
  const { resetTestDb } = await import("./testDb.mjs");
  const { seedTestData } = await import("./testSeed.mjs");

  await resetTestDb();
  await seedTestData();
}
