import fs from "node:fs";
import * as esbuild from "esbuild";

fs.rmSync("../dist", { recursive: true, force: true });

esbuild.buildSync({
  entryPoints: ["index.ts"],
  bundle: true,
  format: "esm",
  sourcemap: true,
  platform: "node",
  target: "node20",
  packages: "external",
  outfile: "../dist/server.js",
});

esbuild.buildSync({
  entryPoints: ["database/migrations/*.ts"],
  outdir: "../dist/migrations",
  format: "esm",
  platform: "node",
  target: "node20",
});
