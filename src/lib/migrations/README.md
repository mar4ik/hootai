# Database Migrations

This directory contains SQL migration scripts for updating your Supabase database structure.

## How to Apply Migrations

### Option 1: Using the Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to the "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of the migration file you want to run
6. Click "Run" to execute the SQL

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db query --file=src/lib/migrations/your_migration_file.sql
```

## Available Migrations

### 1. `add_last_sign_in_column.sql`

Adds a `last_sign_in` column to the `user_profiles` table to track when users sign in.

**When to use:** If you're setting up the `last_sign_in` feature for the first time.

### 2. `update_user_profiles_table.sql`

Updates the `user_profiles` table to add the `last_sign_in` column without recreating existing policies. This is safer if you already have the table set up with custom policies.

**When to use:** If you're getting errors about policies already existing.

### 3. `update_user_trigger.sql`

Updates the `handle_new_user` trigger function to include the `last_sign_in` field when creating new user profiles.

**When to use:** After adding the `last_sign_in` column to make sure new users get a timestamp when they sign up.

## Troubleshooting

### "Policy already exists" error

If you see an error like:
```
ERROR: 42710: policy "Users can view their own profile" for table "user_profiles" already exists
```

Use the `update_user_profiles_table.sql` migration instead of the full schema.

### "Relation does not exist" error

If you see an error about a relation not existing, you might need to create the table first before running these migrations. Use the full schema script in `src/lib/database-schema.sql` to set up the initial structure.

### Checking if migrations applied successfully

After running a migration, you can verify it worked by checking your table structure:

1. Go to the "Table Editor" in the Supabase dashboard
2. Select the `user_profiles` table
3. Check if the `last_sign_in` column is listed 