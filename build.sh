#!/bin/bash

# Function to increment version code in app.json
increment_version() {
    # Read current version code
    current_version=$(node -e "const fs = require('fs'); const app = JSON.parse(fs.readFileSync('app.json')); console.log(app.expo.android.versionCode);")
    new_version=$((current_version + 1))
    
    # Update app.json with new version code
    node -e "const fs = require('fs'); const app = JSON.parse(fs.readFileSync('app.json')); app.expo.android.versionCode = $new_version; fs.writeFileSync('app.json', JSON.stringify(app, null, 2));"
    
    echo "Version code incremented from $current_version to $new_version"
}

echo "🚀 Starting TripSit build process..."

# Increment version code
increment_version

# Run EAS build
echo "🏗️  Starting EAS build..."
bunx eas build --local --platform android --message "Thank you for using TripSit Mobile by Sympact"

echo "✨ Build completed successfully!" 