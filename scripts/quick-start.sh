#!/usr/bin/env bash
# Quick start script for Books Library development environment

set -e

echo "📚 Books Library - Quick Start"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "flake.nix" ]; then
    echo "❌ Error: Must be run from the project root directory"
    echo "   Expected to find flake.nix in current directory"
    exit 1
fi

# Check if direnv is allowed
if ! direnv status | grep -q "Found RC allowed true"; then
    echo "🔧 Setting up development environment..."
    echo "   Allowing direnv to load environment..."
    direnv allow
else
    echo "✅ Development environment is already set up"
fi

echo ""
echo "🎯 Environment status:"
direnv status

echo ""
echo "🛠  Available tools:"
echo "   - Gleam: $(gleam --version 2>/dev/null || echo 'Loading...')"
echo "   - Node.js: $(node --version 2>/dev/null || echo 'Loading...')"
echo "   - SQLite: $(sqlite3 --version 2>/dev/null | cut -d' ' -f1 || echo 'Loading...')"

echo ""
echo "📁 Project structure:"
echo "   - Frontend: $(ls -d src/ 2>/dev/null && echo '✅' || echo '❌ Missing')"
echo "   - Backend: $(ls -d backend/ 2>/dev/null && echo '✅' || echo '⚠️  Will be created')"
echo "   - Data: $(ls -d data/ 2>/dev/null && echo '✅' || echo '⚠️  Will be created')"

echo ""
echo "🚀 Next steps:"
if [ ! -d "backend" ]; then
    echo "   1. Initialize Gleam backend: mkdir backend && cd backend && gleam new . --name books_api"
fi
echo "   2. Install frontend deps: npm install"
echo "   3. Start frontend dev: npm run dev"
if [ -d "backend" ]; then
    echo "   4. Start backend dev: cd backend && gleam run"
fi

echo ""
echo "📖 For detailed setup instructions, see: DEVELOPMENT_ENVIRONMENT.md"
echo ""
