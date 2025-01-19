import fs from "node:fs";
import { join } from "node:path";
import * as esbuild from "esbuild";

function path(relativePath: string): string {
  return join(import.meta.dirname, relativePath);
}

// Clear the output directory
fs.rmSync(path("../dist"), { recursive: true, force: true });

// Copy migrations to output
fs.cpSync(path("database/migrations"), path("../dist/migrations"), { recursive: true });

// Bundle our code
esbuild.buildSync({
  entryPoints: [path("index.ts")],
  bundle: true,
  format: "esm",
  sourcemap: true,
  platform: "node",
  target: "node20",
  packages: "external",
  outfile: path("../dist/server.js"),
  logLevel: "info",
});
