#!/bin/bash

# Script to check for unused variables and other common issues before deployment

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d "." -f 1 | sed 's/v//')

if [ $NODE_MAJOR_VERSION -lt 18 ]; then
  echo "❌ Node.js version $NODE_VERSION is too old. This project requires v18.18.0 or higher."
  echo "Please update your Node.js version before deploying."
  exit 1
else
  echo "✅ Node.js version $NODE_VERSION is compatible."
fi

echo "Checking for linting issues..."

# Run ESLint to check for unused variables and other issues
npx eslint "./src/**/*.{ts,tsx}" --quiet

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Linting issues found. Please fix them before deploying."
  exit 1
else
  echo "✅ No linting issues found!"
fi

# Check for build errors
echo "Checking for build errors..."
npm run build

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix the issues before deploying."
  exit 1
else
  echo "✅ Build successful!"
fi

echo "All checks passed! You're ready to deploy."
exit 0 