#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the path to the database schema file
const schemaFilePath = path.join(__dirname, '..', 'src', 'lib', 'database-schema.sql');

console.log(`
===========================================
Supabase Database Setup Script
===========================================

This script will help you set up your Supabase database for HootAI.
Before running this script, ensure you have:

1. Created a Supabase project at https://supabase.com
2. Installed the Supabase CLI (https://supabase.com/docs/guides/cli)
3. Logged in to the Supabase CLI using 'supabase login'

`);

// Function to read SQL file
function readSqlFile() {
  try {
    return fs.readFileSync(schemaFilePath, 'utf8');
  } catch (error) {
    console.error(`Error reading schema file: ${error.message}`);
    process.exit(1);
  }
}

// Main function to run the script
async function main() {
  try {
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('Supabase CLI is not installed. Please install it first:');
      console.log('npm install -g supabase');
      process.exit(1);
    }

    // Read the schema file
    const sqlSchema = readSqlFile();
    console.log('Database schema file loaded successfully.');

    // Ask for Supabase project info
    rl.question('\nWhat is your Supabase project URL? (e.g., https://YOUR_PROJECT_ID.supabase.co): ', (projectUrl) => {
      if (!projectUrl) {
        console.error('Project URL is required.');
        rl.close();
        return;
      }

      rl.question('What is your Supabase API key? (This is your service_role key for admin access): ', (apiKey) => {
        if (!apiKey) {
          console.error('API key is required.');
          rl.close();
          return;
        }

        // Create a temporary file with the SQL and authentication info
        const tempFilePath = path.join(__dirname, 'temp-schema.sql');
        
        // Write SQL to a temporary file
        fs.writeFileSync(tempFilePath, sqlSchema);
        
        console.log('\nAttempting to apply the database schema...');
        
        try {
          // Execute the SQL against Supabase
          execSync(`SUPABASE_URL="${projectUrl}" SUPABASE_KEY="${apiKey}" supabase db query --file ${tempFilePath}`, { 
            stdio: 'inherit' 
          });
          
          console.log('\n✅ Database schema applied successfully!');
          console.log('\nYour Supabase database is now set up with the following:');
          console.log('- user_profiles table for storing additional user information');
          console.log('- Row Level Security policies to protect user data');
          console.log('- Trigger to automatically create a profile when a user signs up');
        } catch (error) {
          console.error(`\n❌ Failed to apply database schema: ${error.message}`);
          console.log('\nYou can manually apply the schema by:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Navigate to the SQL Editor');
          console.log(`3. Copy the contents of src/lib/database-schema.sql`);
          console.log('4. Run the SQL in the Supabase SQL Editor');
        } finally {
          // Clean up temporary file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          
          rl.close();
        }
      });
    });
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    rl.close();
  }
}

// Run the main function
main(); 