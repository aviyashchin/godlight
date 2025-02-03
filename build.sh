#!/bin/bash

# Create dist directory
mkdir -p dist

# Copy all necessary files to dist
cp -r index.html js/ assets/ dist/
cp package.json dist/

# Copy other HTML files
cp 3dGodLight.html GodLight.html dist/

# Create a .gitignore in dist to exclude unnecessary files
echo "node_modules/" > dist/.gitignore
echo ".DS_Store" >> dist/.gitignore 