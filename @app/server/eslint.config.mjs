import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import { dirname, join } from "path";

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory of the current file
const __dirname = dirname(__filename);

// Go two directories up and resolve the path to .gitignore
const gitignorePath = join(__dirname, "..", "..", ".gitignore");

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // TODO: replace with unknown
      "@typescript-eslint/no-unused-vars": "off", // TODO: fix
      "@typescript-eslint/ban-ts-comment": "off", // TODO: fix
    },
  },
]);
