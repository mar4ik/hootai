# Coding Standards

## Node.js Version Requirements

This project requires Node.js version 18.18.0 or higher due to Next.js 15+ requirements. Using an older version of Node.js will result in build failures.

To ensure you're using the correct version:
- Check your Node.js version with `node -v`
- If needed, update using a version manager like `nvm`, `n`, or `fnm`: 
  - With `n`: `sudo n lts` (to install the latest LTS version)
  - With `nvm`: `nvm install --lts` (to install the latest LTS version)
- The project includes a `.nvmrc` file specifying the recommended version

## Avoiding Unused Variable Errors

To prevent errors related to unused variables in our codebase, please follow these guidelines:

### Catch Variables

When handling exceptions where you don't use the error variable:

```typescript
// ❌ Avoid this (will cause linting errors):
try {
  // some code
} catch (err) {
  // not using err variable
  console.log("An error occurred");
}

// ✅ Use one of these approaches instead:
// 1. Omit the parameter entirely:
try {
  // some code
} catch {
  console.log("An error occurred");
}

// 2. Use underscore prefix for unused variables:
try {
  // some code
} catch (_err) {
  console.log("An error occurred");
}
```

### Destructuring

When destructuring objects but not using all variables:

```typescript
// ❌ Avoid this (will cause linting errors):
const { data, error } = await someFunction();
// Only using error but not data

// ✅ Use one of these approaches instead:
// 1. Only destructure what you need:
const { error } = await someFunction();

// 2. Use underscore prefix for unused variables:
const { _data, error } = await someFunction();
```

## Pre-Deployment Checks

Before deploying, run the following command to check for any linting issues:

```bash
npm run pre-deploy
```

This script will:
1. Check for linting issues, including unused variables
2. Run a build to ensure there are no build errors

## ESLint Configuration

Our ESLint configuration has been set up to automatically ignore variables that start with an underscore (`_`). This is useful for cases where you need to destructure an object but don't need all the properties.

## VS Code Integration

If you're using VS Code, you can enable automatic linting by installing the ESLint extension and adding the following to your workspace settings:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "typescriptreact"]
}
```

This will automatically fix linting issues when you save a file. 