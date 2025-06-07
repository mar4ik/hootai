#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

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
2. Have your Supabase project URL and service role key ready

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

      rl.question('What is your Supabase service role key? (This is found in Project Settings > API > service_role key): ', async (apiKey) => {
        if (!apiKey) {
          console.error('API key is required.');
          rl.close();
          return;
        }

        console.log('\nAttempting to apply the database schema...');
        
        try {
          // Create Supabase client with admin privileges
          const supabase = createClient(projectUrl, apiKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });
          
          // Execute the SQL against Supabase
          const { error } = await supabase.rpc('pgcli', { command: sqlSchema });
          
          if (error) {
            throw error;
          }
          
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