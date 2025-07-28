#!/bin/bash

# SSH to HTTPS Converter - Installation Script

echo "🔧 SSH to HTTPS Converter - Chrome Extension Setup"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

echo "✅ Extension files found"

# Create icons directory if it doesn't exist
if [ ! -d "icons" ]; then
    mkdir -p icons
    echo "📁 Created icons directory"
fi

# Check if icons exist
ICONS_NEEDED=false
for size in 16 48 128; do
    if [ ! -f "icons/icon${size}.png" ]; then
        ICONS_NEEDED=true
        break
    fi
done

if [ "$ICONS_NEEDED" = true ]; then
    echo "⚠️  Icons not found. You can:"
    echo "   1. Open create-icons.html in your browser to generate them"
    echo "   2. Create your own 16x16, 48x48, and 128x128 PNG icons"
    echo "   3. Continue without icons (extension will still work)"
    echo ""
fi

# Validate manifest.json
if command -v jq &> /dev/null; then
    if jq empty manifest.json 2>/dev/null; then
        echo "✅ manifest.json is valid JSON"
    else
        echo "❌ Error: manifest.json contains invalid JSON"
        exit 1
    fi
else
    echo "ℹ️  jq not found, skipping JSON validation"
fi

echo ""
echo "🚀 Installation Instructions:"
echo "=============================="
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo "3. Click 'Load unpacked' button"
echo "4. Select this directory: $(pwd)"
echo "5. The extension should now appear in your extensions list"
echo "6. Pin it to your toolbar for easy access"
echo ""
echo "📋 Extension Features:"
echo "- Automatically converts SSH URLs to HTTPS when pasting"
echo "- Supports GitHub, GitLab, Bitbucket, Azure DevOps, and more"
echo "- Configurable settings via popup interface"
echo "- Custom Git host support"
echo "- Usage statistics tracking"
echo ""
echo "🔍 Testing:"
echo "- Click the extension icon to open settings"
echo "- Use the 'Test Conversion' feature to try different URLs"
echo "- Try pasting: git@github.com:user/repo.git"
echo ""
echo "✨ Setup complete! Follow the installation instructions above."

# Make the script executable
chmod +x "$0" 2>/dev/null || true
