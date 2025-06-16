#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
  # Check if NEXT_PUBLIC_SITE_URL is already in the file
  if grep -q "NEXT_PUBLIC_SITE_URL" .env; then
    echo "NEXT_PUBLIC_SITE_URL already exists in .env, updating..."
    # Replace the line containing NEXT_PUBLIC_SITE_URL
    sed -i '' 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3000|' .env
  else
    echo "Adding NEXT_PUBLIC_SITE_URL to .env..."
    # Add the variable after the NEXT_PUBLIC_SUPABASE_ANON_KEY line
    sed -i '' '/NEXT_PUBLIC_SUPABASE_ANON_KEY/a\
# Site URL for authentication callbacks - set to localhost for development\
NEXT_PUBLIC_SITE_URL=http://localhost:3000' .env
  fi
  echo "Updated .env file"
else
  echo ".env file not found"
fi

# Check if .env.local file exists
if [ -f .env.local ]; then
  # Check if NEXT_PUBLIC_SITE_URL is already in the file
  if grep -q "NEXT_PUBLIC_SITE_URL" .env.local; then
    echo "NEXT_PUBLIC_SITE_URL already exists in .env.local, updating..."
    # Replace the line containing NEXT_PUBLIC_SITE_URL
    sed -i '' 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3000|' .env.local
  else
    echo "Adding NEXT_PUBLIC_SITE_URL to .env.local..."
    # Add the variable after the NEXT_PUBLIC_SUPABASE_ANON_KEY line
    sed -i '' '/NEXT_PUBLIC_SUPABASE_ANON_KEY/a\
# Site URL for authentication callbacks - set to localhost for development\
NEXT_PUBLIC_SITE_URL=http://localhost:3000' .env.local
  fi
  echo "Updated .env.local file"
else
  echo ".env.local file not found"
fi

echo "Environment files updated successfully!" 