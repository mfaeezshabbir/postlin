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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      // Ignore generated Prisma client and other generated assets
      "app/generated/**",
      "**/app/generated/**",
      "app/generated/prisma/**",
      "scripts/**",
      "next-env.d.ts",
    ],
    rules: {
  // stylistic (relaxed)
  semi: "off",
  quotes: "off",
  "comma-dangle": "off",

      // best practices / quality
      "prefer-const": "error",
      "no-console": "warn",
      "no-debugger": "error",

      // unused vars (allow underscore-prefixed args)
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Relax explicit any rule for now across the project; many files use 'any'
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow require() imports in some generated/runtime files
      "@typescript-eslint/no-require-imports": "off",

  // Turn off this-alias and typescript variant of unused-expressions which
  // commonly trip on generated/minified runtime bundles
  "@typescript-eslint/no-this-alias": "off",
  "@typescript-eslint/no-unused-expressions": "off",

  // Disable some noisy rules that conflict with generated/legacy files
  "no-unused-expressions": "off",
  "react/no-unescaped-entities": "off",
  "@typescript-eslint/triple-slash-reference": "off",

      // react / next adjustments
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

export default eslintConfig;
