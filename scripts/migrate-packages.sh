#!/bin/bash
# Script to migrate packages from separate repos to monorepo

set -e

MONOREPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGES_DIR="$MONOREPO_ROOT/packages"

echo "🚀 Starting monorepo migration..."
echo "Monorepo root: $MONOREPO_ROOT"

# Create packages directory
mkdir -p "$PACKAGES_DIR"

# Array of packages to migrate
PACKAGES=("types" "db" "core" "ui" "test-utils")

for package in "${PACKAGES[@]}"; do
  echo ""
  echo "📦 Migrating stride-$package..."
  
  # Check if package already exists
  if [ -d "$PACKAGES_DIR/$package" ]; then
    echo "⚠️  Package $package already exists, skipping..."
    continue
  fi
  
  # Check if source exists in parent directory
  SOURCE="../stride-$package"
  if [ ! -d "$SOURCE" ]; then
    echo "❌ Source not found: $SOURCE"
    echo "   Please ensure stride-$package is cloned in the parent directory"
    continue
  fi
  
  # Copy package contents (excluding .git)
  echo "   Copying files..."
  rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' "$SOURCE/" "$PACKAGES_DIR/$package/"
  
  # Remove individual changeset config
  if [ -d "$PACKAGES_DIR/$package/.changeset" ]; then
    echo "   Removing individual .changeset directory..."
    rm -rf "$PACKAGES_DIR/$package/.changeset"
  fi
  
  # Remove individual GitHub workflows
  if [ -d "$PACKAGES_DIR/$package/.github" ]; then
    echo "   Removing individual .github directory..."
    rm -rf "$PACKAGES_DIR/$package/.github"
  fi
  
  echo "   ✅ Migrated $package"
done

echo ""
echo "🔧 Updating workspace dependencies..."

# Update package.json files to use workspace:* for internal dependencies
for package in "${PACKAGES[@]}"; do
  PACKAGE_JSON="$PACKAGES_DIR/$package/package.json"
  
  if [ -f "$PACKAGE_JSON" ]; then
    echo "   Updating $package/package.json..."
    
    # Use node to update dependencies
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
      
      // Update dependencies
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          if (dep.startsWith('@stridetime/')) {
            pkg.dependencies[dep] = 'workspace:*';
          }
        });
      }
      
      // Update devDependencies
      if (pkg.devDependencies) {
        Object.keys(pkg.devDependencies).forEach(dep => {
          if (dep.startsWith('@stridetime/')) {
            pkg.devDependencies[dep] = 'workspace:*';
          }
        });
      }
      
      fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. cd $MONOREPO_ROOT"
echo "2. yarn install"
echo "3. yarn build"
echo "4. yarn test"
echo "5. Review changes and commit"
