#!/bin/bash
# Script to sync all package versions to a specific version

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./sync-versions.sh <version>"
  echo "Example: ./sync-versions.sh 1.0.0"
  exit 1
fi

MONOREPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGES_DIR="$MONOREPO_ROOT/packages"

echo "🔄 Syncing all packages to version $VERSION..."

# Update each package
for package_dir in "$PACKAGES_DIR"/*; do
  if [ -d "$package_dir" ]; then
    package_name=$(basename "$package_dir")
    PACKAGE_JSON="$package_dir/package.json"
    
    if [ -f "$PACKAGE_JSON" ]; then
      echo "   Updating $package_name..."
      
      # Use node to update version
      node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
        pkg.version = '$VERSION';
        fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
      "
    fi
  fi
done

echo ""
echo "✅ All packages synced to version $VERSION"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Commit: git add . && git commit -m 'chore: sync versions to $VERSION'"
echo "3. Tag: git tag v$VERSION"
echo "4. Push: git push && git push --tags"
