#!/bin/bash
# pm2 ecosystem file for production deployment

# Install dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Installing backend dependencies..."
cd ../backend
npm install

echo "Building backend..."
npm run build

echo "Setup complete! Run 'pm2 start ecosystem.config.js' to start services."
