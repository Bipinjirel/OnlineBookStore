#!/bin/bash

# Script to remove secrets from git history
# Run this script to clean your repository before pushing to GitHub

echo "=== Removing secrets from git history ==="

# Check if git repository
if [ ! -d .git ]; then
    echo "Error: Not a git repository"
    exit 1
fi

# Step 1: Remove the secret files from git index
echo "Step 1: Removing secret files from git index..."
git rm --cached backend/config/serviceAccountKey.json 2>/dev/null
git rm --cached "**/firebase-adminsdk-*.json" 2>/dev/null
git rm --cached backend/.env 2>/dev/null

# Step 2: Use git filter-branch to remove secrets from history
echo "Step 2: Removing secrets from git history (this may take a while)..."

# Remove service account keys
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/config/serviceAccountKey.json' \
  --prune-empty --tag-name-filter cat -- --all 2>/dev/null

# Remove any firebase admin sdk files
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch "**/firebase-adminsdk-*.json"' \
  --prune-empty --tag-name-filter cat -- --all 2>/dev/null

# Remove .env files
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all 2>/dev/null

echo "Step 3: Cleaning up reflog..."
git reflog expire --expire=now --all && git gc --prune=now --aggressive

echo "=== Secrets removed from git history ==="
echo ""
echo "Next steps:"
echo "1. Commit the updated .gitignore: git add .gitignore && git commit -m 'Update .gitignore'"
echo "2. Push to GitHub: git push origin main --force"
echo ""
echo "WARNING: Force push will rewrite history. Coordinate with collaborators."
