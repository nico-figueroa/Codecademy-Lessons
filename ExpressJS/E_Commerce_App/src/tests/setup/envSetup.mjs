import dotenv from "dotenv";
import path from "path";

export default async function () {
  const envPath = path.join(
    process.cwd(),
    "src",
    "tests",
    "setup",
    ".env.test",
  );
  console.log("🔍 Loading test env from:", envPath);

  dotenv.config({ path: envPath });

  console.log("🔍 ENV LOADED:", {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
  });
}
