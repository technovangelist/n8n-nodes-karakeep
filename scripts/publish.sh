#!/bin/bash

# n8n-nodes-karakeep Publishing Script
# This script handles the complete publishing process to npm

set -e  # Exit on any error

echo "🚀 Starting n8n-nodes-karakeep publishing process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if user is logged into npm
print_status "Checking npm authentication..."
if ! npm whoami > /dev/null 2>&1; then
    print_error "You are not logged into npm. Please run 'npm login' first."
    exit 1
fi

NPM_USER=$(npm whoami)
print_success "Logged in as: $NPM_USER"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Calculate version previews
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

patch_version="$major.$minor.$((patch + 1))"
minor_version="$major.$((minor + 1)).0"
major_version="$((major + 1)).0.0"

# Ask for version bump type
echo ""
echo "Select version bump type:"
echo "1) Patch (bug fixes): $CURRENT_VERSION -> $patch_version"
echo "2) Minor (new features): $CURRENT_VERSION -> $minor_version"
echo "3) Major (breaking changes): $CURRENT_VERSION -> $major_version"
echo "4) Custom version"
echo "5) Skip version bump (publish current version)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Bumping patch version..."
        NEW_VERSION=$(npm version patch --no-git-tag-version)
        ;;
    2)
        print_status "Bumping minor version..."
        NEW_VERSION=$(npm version minor --no-git-tag-version)
        ;;
    3)
        print_status "Bumping major version..."
        NEW_VERSION=$(npm version major --no-git-tag-version)
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " custom_version
        print_status "Setting version to $custom_version..."
        NEW_VERSION=$(npm version $custom_version --no-git-tag-version)
        ;;
    5)
        print_status "Skipping version bump..."
        NEW_VERSION="v$CURRENT_VERSION"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_success "Version set to: ${NEW_VERSION#v}"

# Clean previous build
print_status "Cleaning previous build..."
npm run clean

# Run tests
print_status "Running tests..."
if npm test; then
    print_success "All tests passed!"
else
    print_warning "Some tests failed!"
    echo ""
    read -p "Do you want to continue publishing despite test failures? (y/N): " continue_with_failures
    if [[ ! $continue_with_failures =~ ^[Yy]$ ]]; then
        print_error "Publishing cancelled due to test failures."
        exit 1
    fi
    print_warning "Continuing with publishing despite test failures..."
fi

# Build the project
print_status "Building project..."
if npm run build; then
    print_success "Build completed successfully!"
else
    print_error "Build failed. Please fix the issues before publishing."
    exit 1
fi

# Create package tarball
print_status "Creating package tarball..."
TARBALL=$(npm pack)
print_success "Created tarball: $TARBALL"

# Ask for confirmation
echo ""
print_warning "Ready to publish n8n-nodes-karakeep@${NEW_VERSION#v} to npm"
echo "Package contents:"
echo "- Built files in dist/"
echo "- README.md"
echo "- package.json"
echo "- All node resources and credentials"
echo ""

read -p "Do you want to proceed with publishing? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    print_status "Publishing to npm..."
    
    if npm publish "$TARBALL"; then
        print_success "🎉 Successfully published n8n-nodes-karakeep@${NEW_VERSION#v} to npm!"
        print_success "📦 Package URL: https://www.npmjs.com/package/n8n-nodes-karakeep"
        
        # Clean up tarball
        rm "$TARBALL"
        
        echo ""
        print_status "Next steps:"
        echo "1. Update your GitHub repository with the new version"
        echo "2. Create a GitHub release with changelog"
        echo "3. Test installation: npm install n8n-nodes-karakeep@${NEW_VERSION#v}"
        echo "4. Announce the update to users"
        
    else
        print_error "Publishing failed!"
        rm "$TARBALL"
        exit 1
    fi
else
    print_status "Publishing cancelled by user."
    rm "$TARBALL"
    exit 0
fi

print_success "Publishing process completed! 🚀"