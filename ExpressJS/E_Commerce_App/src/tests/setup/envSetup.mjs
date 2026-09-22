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
  console.log("🔍 Test environment loaded.");
}
