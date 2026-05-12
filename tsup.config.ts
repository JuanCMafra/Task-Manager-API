import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "build",
  format: ["cjs"],

  outExtension() {
    return {
      js: ".js",
    };
  },

  clean: true,
  bundle: false,
  splitting: false,
  sourcemap: true,
  target: "node22",
  skipNodeModulesBundle: true,
});