import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const assetsDir = join(process.cwd(), "dist", "client", "_astro");
const maxJsBytes = 450 * 1024;

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  let files;
  try {
    files = await readdir(assetsDir);
  } catch (error) {
    console.error("Bundle size check failed: build output not found at dist/client/_astro.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const jsEntries = [];
  for (const file of files) {
    if (extname(file) !== ".js") continue;
    const fullPath = join(assetsDir, file);
    const fileStat = await stat(fullPath);
    jsEntries.push({ file, bytes: fileStat.size });
  }

  if (jsEntries.length === 0) {
    console.error("Bundle size check failed: no JS files found in dist/client/_astro.");
    process.exit(1);
  }

  jsEntries.sort((a, b) => b.bytes - a.bytes);
  const largest = jsEntries[0];
  const oversized = jsEntries.filter((entry) => entry.bytes > maxJsBytes);
  const heroCanvasChunks = jsEntries.filter((entry) => basename(entry.file).startsWith("HeroCanvas."));

  console.log(`Largest client JS chunk: ${largest.file} (${formatKb(largest.bytes)})`);

  if (heroCanvasChunks.length > 0) {
    console.error("Bundle size check failed: HeroCanvas chunk is still present in the client build.");
    heroCanvasChunks.forEach((entry) => {
      console.error(` - ${entry.file} (${formatKb(entry.bytes)})`);
    });
    process.exit(1);
  }

  if (oversized.length > 0) {
    console.error(`Bundle size check failed: JS chunk exceeds ${formatKb(maxJsBytes)}.`);
    oversized.forEach((entry) => {
      console.error(` - ${entry.file} (${formatKb(entry.bytes)})`);
    });
    process.exit(1);
  }

  console.log(`Bundle size check passed: all JS chunks are <= ${formatKb(maxJsBytes)}.`);
}

await main();
