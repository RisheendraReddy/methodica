#!/bin/bash
# Start Frontend Server

cd "$(dirname "$0")/client"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the React development server
echo "Starting frontend server on http://localhost:3000"
npm start

