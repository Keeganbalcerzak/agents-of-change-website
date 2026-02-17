import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../src", import.meta.url));
const EXTENSIONS = new Set([".astro", ".ts", ".tsx", ".md", ".mdx"]);
const matcher = /href\s*=\s*["']#["']/g;

const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const absolute = join(dir, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      walk(absolute);
      continue;
    }

    if (!EXTENSIONS.has(extname(absolute))) {
      continue;
    }

    const contents = readFileSync(absolute, "utf8");
    const lines = contents.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      if (matcher.test(lines[i])) {
        offenders.push(`${absolute}:${i + 1} -> ${lines[i].trim()}`);
      }
      matcher.lastIndex = 0;
    }
  }
}

walk(ROOT);

if (offenders.length > 0) {
  console.error("Empty anchor links are not allowed. Replace href=\"#\" with real routes.");
  for (const offender of offenders) {
    console.error(`- ${offender}`);
  }
  process.exit(1);
}

console.log("No empty anchor links found.");
