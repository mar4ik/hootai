import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Import the core-web-vitals and typescript configs from Next.js
const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

const eslintConfig = [
  ...nextConfigs,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 0,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused variables that start with underscore
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_' 
      }]
    }
  }
];

export default eslintConfig;
