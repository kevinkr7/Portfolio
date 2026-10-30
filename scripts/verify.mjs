import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const sourceContent = resolve(root, "src/content/projects.json");
const runtimeLock = resolve(root, "src/runtime-lock.json");

const requiredRoutes = [
  "index.html",
  "lite/index.html",
  "projects/index.html",
  "about/index.html",
  "contact/index.html",
  "projects/noctalink/index.html",
  "projects/nexasense/index.html",
  "projects/crosswise/index.html",
  "projects/cadenza/index.html",
  "projects/harmonza/index.html",
  "projects/percepta/index.html",
  "projects/canteen-cuisine-commander/index.html",
  "projects/spotifix/index.html",
  "projects/evalion/index.html",
  "projects/cesium/index.html",
  "api/lite-cards"
];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const missingRoutes = [];
for (const route of requiredRoutes) {
  try { await access(join(dist, route)); } catch { missingRoutes.push(route); }
}

const source = JSON.parse(await readFile(sourceContent, "utf8"));
const built = await readFile(join(dist, "api/lite-cards"), "utf8");
const contentMatches = built === JSON.stringify(source);

const lock = JSON.parse(await readFile(runtimeLock, "utf8"));
const changedRuntimeFiles = [];
const missingRuntimeFiles = [];
for (const [name, expected] of Object.entries(lock.files)) {
  try {
    const bytes = await readFile(join(dist, name));
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== expected) changedRuntimeFiles.push(name);
  } catch {
    missingRuntimeFiles.push(name);
  }
}

const files = await walk(dist);
const editableRuntimeFiles = new Set(["api/lite-cards"]);
const lockedRuntimeFiles = new Set(Object.keys(lock.files));
const unexpectedRuntimeFiles = files
  .map((file) => file.slice(dist.length + 1).replaceAll("\\", "/"))
  .filter((name) => !editableRuntimeFiles.has(name) && !lockedRuntimeFiles.has(name));
let bytes = 0;
for (const file of files) bytes += (await stat(file)).size;

const report = {
  files: files.length,
  sizeMB: Math.round(bytes / 1024 / 1024 * 100) / 100,
  projects: source.cards?.length ?? 0,
  contentMatches,
  lockedRuntimeFiles: Object.keys(lock.files).length,
  missingRoutes,
  missingRuntimeFiles,
  changedRuntimeFiles,
  unexpectedRuntimeFiles,
};

console.log(JSON.stringify(report, null, 2));
if (
  !contentMatches
  || missingRoutes.length
  || missingRuntimeFiles.length
  || changedRuntimeFiles.length
  || unexpectedRuntimeFiles.length
) process.exitCode = 1;
