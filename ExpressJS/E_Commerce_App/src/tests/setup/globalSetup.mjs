import dotenv from "dotenv";
import path from "path";

// Load .env.test AGAIN because globalSetup runs in a separate process
const envPath = path.join(process.cwd(), "src", "tests", "setup", ".env.test");
dotenv.config({ path: envPath });

console.log("🔧 globalSetup environment loaded.");

export default async function () {
  const { resetTestDb } = await import("./testDb.mjs");
  const { seedTestData } = await import("./testSeed.mjs");

  await resetTestDb();
  await seedTestData();
}
