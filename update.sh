#!/bin/bash

# Check if a branch name was provided as an argument
BRANCH=${1:-main}  # Default to 'main' if no argument is provided

# Set the directory based on the branch

if [ "$BRANCH" = "dev" ]; then
    PROJECT_DIR="/var/www/warehouse-front-admin-dev/Warehouse-2-admin"
elif [ "$BRANCH" = "stage" ]; then
    PROJECT_DIR="/var/www/stage"
else
    PROJECT_DIR="/var/www/warehouse-front-admin/Warehouse-2-admin"
fi

# Navigate to the project directory
cd "$PROJECT_DIR" || exit

# Pull the latest changes from the specified branch
echo "Switching to branch: $BRANCH in directory: $PROJECT_DIR"
git fetch origin
git reset --hard origin/$BRANCH
git pull origin $BRANCH -f
