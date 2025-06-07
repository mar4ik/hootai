# HootAI Admin Pages

This document explains the admin pages and tools that are available locally but excluded from git repositories.

## Admin Pages

The following admin pages are available but excluded from git:

- `/admin` - Admin dashboard with links to all tools
- `/admin/db-setup` - Set up the database structure
- `/admin/create-profile` - Manually create user profiles
- `/admin/fix-profiles` - Quick fixes for common profile issues
- `/admin/migrate-db` - Database migration tools
- `/debug` - Connection testing and debugging
- `/test-db` - Database connection testing

## Why These Pages Are Excluded

These pages are excluded from git for security reasons. They provide direct access to database management and could be misused if deployed in production. By keeping them local-only, we ensure they're only available during development.

## How to Use Admin Pages

1. The admin pages are available at `/admin` when running locally
2. Use these pages to troubleshoot database issues
3. The "Fix Profiles" page provides one-click solutions for common problems

## Backing Up Admin Pages

Before committing your changes, you can back up the admin pages:

```bash
./admin-setup.sh backup
```

This will copy all admin pages to an `admin-backup` directory that is also excluded from git.

## Restoring Admin Pages

If you need to restore admin pages on another machine:

1. Clone the repository
2. Copy your `admin-backup` directory to the project root
3. Run the setup script:

```bash
./admin-setup.sh
```

This will restore all admin pages from your backup.

## Troubleshooting User Profiles

If users are missing profiles:

1. Go to `/admin/fix-profiles` and click "Run All Fixes"
2. If that doesn't work, go to `/admin/create-profile` and create a profile manually
3. Check the database connection at `/debug` to make sure Supabase is properly configured 