import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/tests/**/*.ts"],
  outDir: "build",
  format: ["cjs"],
  clean: true,
  bundle: false,
  splitting: false,
  sourcemap: true,
  skipNodeModulesBundle: true,
});