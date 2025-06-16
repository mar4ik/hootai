#!/usr/bin/env node

/**
 * This script verifies that the required environment variables are set
 */

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

// Check for required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL'
];

// Get environment from .env files
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Check each required variable
let hasErrors = false;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    hasErrors = true;
  }
});

// Provide guidance if there are errors
if (hasErrors) {
  console.log(`\n${colors.yellow}Some required environment variables are missing.${colors.reset}`);
  console.log(`Please create or update your ${colors.bright}.env.local${colors.reset} file with the following variables:\n`);
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`${varName}=your_value_here`);
    }
  });
  
  console.log(`\nFor local development, set ${colors.bright}NEXT_PUBLIC_SITE_URL=http://localhost:3000${colors.reset}`);
  console.log(`For production, set ${colors.bright}NEXT_PUBLIC_SITE_URL=https://www.hootai.am${colors.reset}`);
  
  process.exit(1);
} 