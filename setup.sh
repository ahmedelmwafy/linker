#!/bin/bash

# Linker - Local Setup Script
echo "------------------------------------------"
echo "🚀 Welcome to Linker Local Setup"
echo "------------------------------------------"

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# 2. Install Dependencies
echo "📦 Installing project dependencies..."
npm install

# 3. Create necessary directories
echo "📂 Preparing folders..."
mkdir -p public/uploads

# 4. Final Instructions
echo ""
echo "✅ Setup Complete!"
echo "------------------------------------------"
echo "To start the Linker server, run:"
echo "npm run dev"
echo ""
echo "Then open http://localhost:3000 on your PC"
echo "and scan the QR code with your iPhone!"
echo "------------------------------------------"
