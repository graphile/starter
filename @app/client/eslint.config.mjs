import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // TODO: replace with unknown
      "@typescript-eslint/no-unused-vars": "off", // TODO: fix
      "@typescript-eslint/ban-ts-comment": "off", // TODO: fix
    },
  },
];

export default eslintConfig;
