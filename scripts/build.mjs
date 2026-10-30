import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contentPath = resolve(root, "src/content/projects.json");
const outputPath = resolve(root, "dist/api/lite-cards");

const content = JSON.parse(await readFile(contentPath, "utf8"));
if (!Array.isArray(content.cards) || content.cards.length === 0) {
  throw new Error("src/content/projects.json must contain a non-empty cards array.");
}

const slugs = new Set();
for (const [index, card] of content.cards.entries()) {
  if (!card || typeof card !== "object") throw new Error(`Project ${index + 1} must be an object.`);
  for (const field of ["slug", "name", "image", "editorial", "gallery"]) {
    if (!(field in card)) throw new Error(`Project ${index + 1} is missing ${field}.`);
  }
  if (slugs.has(card.slug)) throw new Error(`Duplicate project slug: ${card.slug}`);
  slugs.add(card.slug);
}

await mkdir(dirname(outputPath), { recursive: true });
const serialized = JSON.stringify(content);
await writeFile(outputPath, serialized, "utf8");

console.log(JSON.stringify({
  output: "dist/api/lite-cards",
  projects: content.cards.length,
  bytes: Buffer.byteLength(serialized),
  runtime: "preserved",
}));
