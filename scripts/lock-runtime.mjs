import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const output = resolve(root, "src/runtime-lock.json");
const editable = new Set(["api/lite-cards"]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const manifest = {};
for (const file of (await walk(dist)).sort()) {
  const name = relative(dist, file).replaceAll("\\", "/");
  if (editable.has(name)) continue;
  const bytes = await readFile(file);
  manifest[name] = createHash("sha256").update(bytes).digest("hex");
}

await writeFile(output, `${JSON.stringify({ algorithm: "sha256", files: manifest }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "src/runtime-lock.json", lockedFiles: Object.keys(manifest).length }));
