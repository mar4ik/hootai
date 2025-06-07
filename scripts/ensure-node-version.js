#!/usr/bin/env node

/**
 * This script ensures that the user is running a compatible version of Node.js
 * for the Next.js application.
 */

const requiredNodeVersion = '^18.18.0 || ^19.8.0 || >= 20.0.0';
const currentNodeVersion = process.version;
let isCompatible = false;

// Simple semver check
function checkVersion() {
  const current = currentNodeVersion.slice(1).split('.').map(Number);
  
  // Check for Node.js 18.18.0 or higher
  if (current[0] === 18 && (current[1] > 18 || (current[1] === 18 && current[2] >= 0))) {
    return true;
  }
  
  // Check for Node.js 19.8.0 or higher
  if (current[0] === 19 && (current[1] >= 8)) {
    return true;
  }
  
  // Check for Node.js 20.0.0 or higher
  if (current[0] >= 20) {
    return true;
  }
  
  return false;
}

isCompatible = checkVersion();

if (!isCompatible) {
  console.error('\x1b[31m%s\x1b[0m', '╔════════════════════════════════════════════════════════════╗');
  console.error('\x1b[31m%s\x1b[0m', '║                    Node.js Version Error                    ║');
  console.error('\x1b[31m%s\x1b[0m', '╚════════════════════════════════════════════════════════════╝');
  console.error();
  console.error(`You are using Node.js ${currentNodeVersion}`);
  console.error(`For Next.js, Node.js version "${requiredNodeVersion}" is required.`);
  console.error();
  console.error('To fix this issue:');
  console.error();
  
  // Check if NVM is available
  try {
    const { execSync } = require('child_process');
    const hasNvm = execSync('command -v nvm').toString().trim() !== '';
    
    if (hasNvm) {
      console.error('1. You have nvm installed. Try one of these commands:');
      console.error('   nvm use 20');
      console.error('   nvm install 20 && nvm use 20');
      console.error();
    }
  } catch (e) {
    // NVM not found
    console.error('1. Install a compatible version of Node.js:');
    console.error('   - Using nvm (recommended): https://github.com/nvm-sh/nvm');
    console.error('   - Direct download: https://nodejs.org/');
    console.error();
  }
  
  console.error('2. After installing, run the app with the new Node.js version.');
  console.error();
  console.error('For help, see the Next.js documentation:');
  console.error('https://nextjs.org/docs/getting-started/installation');
  
  process.exit(1);
}

// If we get here, we're using a compatible version
console.log(`✅ Using Node.js ${currentNodeVersion} (compatible with Next.js requirements)`); 