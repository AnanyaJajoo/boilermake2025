#!/bin/bash

# Production build script for Slynk AI Personas

# Ensure script stops on first error
set -e

echo "=== Slynk AI Personas Production Build ==="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create a .env.production file with your production credentials."
  echo "See PRODUCTION-DEPLOY.md for instructions."
  exit 1
fi

# Clean up previous builds
echo "Cleaning up previous builds..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building for production..."
pnpm build

echo ""
echo "=== Build completed successfully! ==="
echo ""
echo "To start the production server, run: pnpm start"
echo "See PRODUCTION-DEPLOY.md for complete deployment instructions." 