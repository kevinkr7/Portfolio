import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd(), "dist");
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".glb": "model/gltf-binary",
  ".ktx2": "image/ktx2",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".opus": "audio/ogg",
  ".wav": "audio/wav"
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const safePath = normalize(relativePath).replace(/^(\.\.(\\|\/|$))+/, "");
  let filePath = resolve(join(root, safePath));

  try {
    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      if (safePath.startsWith("lite/")) {
        filePath = resolve(join(root, "lite", "index.html"));
      } else {
        throw new Error("Not found");
      }
    }
    if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
    const relative = filePath.slice(root.length).replaceAll("\\", "/");
    const contentType = relative.startsWith("/api/")
      ? "application/json; charset=utf-8"
      : types[extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(4173, "127.0.0.1", () => {
  process.stdout.write("Local: http://127.0.0.1:4173\n");
});
