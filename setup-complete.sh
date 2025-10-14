#!/bin/bash

# Has-Needs: Complete Setup Script
# --------------------------------
# Installs Agregore browser and sets up Has-Needs for P2P usage

set -e

echo "🚀 Has-Needs + Agregore Complete Setup"
echo "======================================"
echo ""

# Check if Agregore is already installed
if command -v agregore &> /dev/null; then
    echo "✅ Agregore browser already installed"
else
    echo "📦 Installing Agregore browser..."

    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        if command -v snap &> /dev/null; then
            echo "📦 Installing via Snap..."
            sudo snap install agregore-browser
        elif command -v apt &> /dev/null; then
            echo "📦 Installing via APT (Ubuntu/Debian)..."
            sudo apt update
            sudo apt install -y wget
            wget -O agregore.deb "https://github.com/AgregoreWeb/agregore-browser/releases/latest/download/agregore-browser-linux-amd64.deb"
            sudo dpkg -i agregore.deb
        else
            echo "❌ Unsupported Linux distribution"
            echo "Please install Agregore manually: https://github.com/AgregoreWeb/agregore-browser/releases"
            exit 1
        fi

    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            echo "📦 Installing via Homebrew..."
            brew install agregore-browser
        else
            echo "❌ Homebrew not found"
            echo "Please install Homebrew first: https://brew.sh/"
            echo "Then run: brew install agregore-browser"
            exit 1
        fi

    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows installation (Git Bash)
        echo "📦 Downloading Windows version..."
        AGREGORE_URL="https://github.com/AgregoreWeb/agregore-browser/releases/latest/download/agregore-browser-win32-x64.zip"
        wget -O agregore.zip "$AGREGORE_URL"
        unzip agregore.zip -d agregore-browser
        echo "✅ Agregore downloaded to: agregore-browser/"
        echo "Please move it to your preferred location and add to PATH"

    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Agregore manually: https://github.com/AgregoreWeb/agregore-browser/releases"
        exit 1
    fi
fi

echo ""
echo "🔨 Setting up Has-Needs..."

# Install Node.js dependencies
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

npm install

# Build Has-Needs
echo "🔨 Building Has-Needs..."
npm run build

# Create IPFS deployment
echo "📦 Preparing IPFS deployment..."
npm run deploy:ipfs

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "✅ Agregore browser installed"
echo "✅ Has-Needs built and deployed to IPFS"
echo "✅ QR code connection system ready"
echo "✅ P2P protocols configured"
echo ""
echo "🚀 Next Steps:"
echo "1. Launch Agregore browser"
echo "2. Navigate to: ipfs://<your-hash>/"
echo "3. Or use: https://gateway.pinata.cloud/ipfs/<your-hash>/"
echo "4. Use QR codes to connect with other users"
echo ""
echo "📚 Documentation:"
echo "   - Agregore Setup: AGREGORE-SETUP.md"
echo "   - Integration Guide: AGREGORE-INTEGRATION-PLAN.md"
echo "   - Bundle Creation: create-agregore-bundle.sh"
echo ""
echo "🌟 Ready for decentralized social networking!"
