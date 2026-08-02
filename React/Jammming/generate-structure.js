import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// Folders to skip entirely
const IGNORE = new Set(["node_modules", "public", ".git"]);

// Toggle this ON if you want file contents included
const INCLUDE_CONTENT = true;

// Simple heuristics for classifying files
function classifyFile(name, fullPath) {
  const ext = path.extname(name);

  // Assets
  if ([".png", ".jpg", ".jpeg", ".svg", ".gif"].includes(ext)) return "asset";

  // Styles
  if (ext === ".css") return "style";

  // Root-level project files
  if (ext === ".html") return "root";
  if (ext === ".md") return "root";

  // Config files
  if (name === "package.json") return "config";
  if (name === "vite.config.js") return "config";
  if (name.endsWith("config.js")) return "config";
  if (name.endsWith("config.json")) return "config";

  // Hooks
  if (name.startsWith("use") && ext === ".js") return "hook";

  // Components
  if (ext === ".jsx" || ext === ".tsx") return "component";

  // Utilities
  if (ext === ".js" || ext === ".ts") return "util";

  // Data files
  if (ext === ".json") return "data";

  return "file";
}

// Extract import statements from JS/TS/JSX/TSX files
function extractImports(fullPath) {
  const ext = path.extname(fullPath);
  if (![".js", ".jsx", ".ts", ".tsx"].includes(ext)) return [];

  const content = fs.readFileSync(fullPath, "utf8");
  const importRegex = /import\s+.*?from\s+["'](.+?)["']/g;

  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function mapFolder(folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  const result = {
    name: path.basename(folderPath),
    type: "folder",
    children: []
  };

  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;

    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      result.children.push(mapFolder(fullPath));
    } else {
      const fileType = classifyFile(entry.name, fullPath);
      const imports = extractImports(fullPath);

      const fileInfo = {
        name: entry.name,
        type: fileType,
        extension: path.extname(entry.name),
        fullPath: fullPath.replace(ROOT + path.sep, ""),
        imports
      };

      if (INCLUDE_CONTENT && ["component", "hook", "util"].includes(fileType)) {
        fileInfo.content = fs.readFileSync(fullPath, "utf8");
      }

      result.children.push(fileInfo);
    }
  }

  return result;
}

function main() {
  let projectName = path.basename(ROOT);

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
    if (pkg.name) projectName = pkg.name;
  } catch {}

  const structure = {
    project: projectName,
    generatedAt: new Date().toISOString(),
    notes: "node_modules and public are standard Vite folders and were skipped.",
    root: mapFolder(ROOT)
  };

  fs.writeFileSync("project-structure.json", JSON.stringify(structure, null, 2));
  console.log(`Generated project-structure.json for project: ${projectName}`);
}

main();