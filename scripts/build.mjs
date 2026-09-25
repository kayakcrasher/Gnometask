import { build, initialize } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));

// 1. Tailwind
console.log("[build] tailwind…");
execFileSync(
  path.join(root, "node_modules", ".bin", "tailwindcss"),
  ["-i", path.join(src, "index.css"), "-o", path.join(dist, "styles.css"), "--minify"],
  { stdio: "inherit", cwd: root },
);

// 2. esbuild-wasm
console.log("[build] esbuild-wasm…");
await initialize({});
await build({
  entryPoints: [path.join(src, "main.tsx")],
  bundle: true,
  outfile: path.join(dist, "bundle.js"),
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  sourcemap: false,
  logLevel: "info",
  alias: { "@": src },
  define: { "process.env.NODE_ENV": '"development"' },
  loader: {
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".svg": "dataurl",
    ".woff": "dataurl",
    ".woff2": "dataurl",
  },
});

console.log("[build] done →", dist);
