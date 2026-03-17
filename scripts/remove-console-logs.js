const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = ["node_modules", ".next", "scripts/pre-deploy-check.js", "next.config"];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    const rel = path.relative(ROOT, full);
    if (fs.statSync(full).isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(f)) walk(full, files);
    } else if (/\.(tsx?|jsx?)$/.test(f) && !SKIP.some((s) => rel.includes(s))) {
      files.push(full);
    }
  }
  return files;
}

function removeConsoleLines(content) {
  let out = content;
  // Remove single-line console.log/debug/info
  out = out.replace(/^\s*console\.(log|debug|info)\([^)]*\);?\s*\r?\n/gm, "");
  // Remove multiline: console.log( ... ); where ... can span lines (non-greedy)
  out = out.replace(/^\s*console\.(log|debug|info)\(\s*\n[\s\S]*?\);\s*\r?\n/gm, "");
  return out;
}

const files = walk(ROOT);
let count = 0;
for (const file of files) {
  const orig = fs.readFileSync(file, "utf8");
  const next = removeConsoleLines(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next, "utf8");
    count++;
    console.log(path.relative(ROOT, file));
  }
}
