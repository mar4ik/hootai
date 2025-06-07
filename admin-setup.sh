#!/bin/bash

# Admin Setup Script for HootAI
# This script will restore admin pages that are excluded from git

echo "Setting up admin and debug pages..."

# Create directories if they don't exist
mkdir -p src/app/admin
mkdir -p src/app/admin/db-setup
mkdir -p src/app/admin/create-profile
mkdir -p src/app/admin/fix-profiles
mkdir -p src/app/admin/migrate-db
mkdir -p src/app/admin/run-sql
mkdir -p src/app/debug
mkdir -p src/app/test-db

# Copy files from backup directory if it exists
if [ -d "admin-backup" ]; then
  echo "Restoring from backup directory..."
  cp -r admin-backup/* src/
  echo "Admin pages restored from backup."
  exit 0
fi

# Create backup directory
mkdir -p admin-backup/app/admin
mkdir -p admin-backup/app/debug
mkdir -p admin-backup/app/test-db
mkdir -p admin-backup/lib

# Backup admin pages before committing
backup_admin() {
  echo "Backing up admin pages to admin-backup directory..."
  cp -r src/app/admin admin-backup/app/
  cp -r src/app/debug admin-backup/app/
  cp -r src/app/test-db admin-backup/app/
  cp src/lib/database-functions.sql admin-backup/lib/
  echo "Backup completed."
}

# Function to be called before committing
prepare_for_commit() {
  backup_admin
  echo "Ready for commit. Admin pages are backed up and excluded from git."
}

# Print help
echo "Admin setup script for HootAI"
echo ""
echo "To backup admin pages before committing:"
echo "  ./admin-setup.sh backup"
echo ""

# Handle arguments
if [ "$1" == "backup" ]; then
  backup_admin
fi

echo "Admin setup completed." 