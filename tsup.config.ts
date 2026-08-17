import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    daemon: "src/daemon.ts",
  },

  format: ["esm"],

  target: "node22",

  platform: "node",

  clean: true,

  sourcemap: true,

  bundle: true,

  splitting: false,

  outDir: "dist",

  banner: {
    js: "#!/usr/bin/env node",
  },
});
