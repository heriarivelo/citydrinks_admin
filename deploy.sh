#!/bin/bash

# Check if a branch name was provided as an argument
BRANCH=${1:-main}  # Default to 'main' if no argument is provided

if [ "$BRANCH" = "dev" ]; then
    PROJECT_DIR="/var/www/warehouse-front-admin-dev/Warehouse-2-admin"
elif [ "$BRANCH" = "stage" ]; then
    PROJECT_DIR="/var/www/stage"
else
    PROJECT_DIR="/var/www/warehouse-front-admin/Warehouse-2-admin"
fi

cd "$PROJECT_DIR"

rm -rf node_modules dist package-lock.json
# Install dependencies
npm install

# Build the project
npm run build

# Any other commands you need to run
