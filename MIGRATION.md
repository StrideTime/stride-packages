# Migration Guide: Converting to Monorepo

This guide will help you migrate from separate repos to the monorepo structure.

## Step 1: Create the Monorepo

```bash
# Create new repo on GitHub
gh repo create stridetime/stride-packages --public

# Clone it locally
git clone https://github.com/stridetime/stride-packages.git
cd stride-packages

# Copy the monorepo structure files (already created)
```

## Step 2: Move Packages

For each package (types, db, core, ui, test-utils):

```bash
# From the monorepo root
mkdir -p packages

# Clone the individual package repo
git clone https://github.com/stridetime/stride-<package>.git temp-<package>

# Move the package contents
mv temp-<package> packages/<package>

# Remove the .git directory from the package
rm -rf packages/<package>/.git

# Clean up
rm -rf temp-<package>
```

## Step 3: Update Package Configurations

For each package in `packages/`:

1. **Keep the existing package.json** but ensure:
   - Dependencies reference workspace packages with `workspace:*`
   - Remove individual changeset configs (use root config)

2. **Remove individual .github/workflows** (use root workflows)

3. **Remove individual .changeset** directories (use root)

Example dependency update in package.json:
```json
{
  "dependencies": {
    "@stridetime/types": "workspace:*",
    "@stridetime/db": "workspace:*"
  }
}
```

## Step 4: Sync Versions

Decide on a starting version for all packages (e.g., 1.0.0):

```bash
# Update all package.json versions to the same version
# This can be done manually or with a script
```

## Step 5: Install and Test

```bash
# Install all dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Verify everything works
yarn lint
yarn typecheck
```

## Step 6: Create Initial Changeset

```bash
# Create a changeset for the monorepo migration
yarn changeset

# Select all packages, choose "major" bump
# Summary: "Migrate to monorepo structure"
```

## Step 7: Commit and Push

```bash
git add .
git commit -m "feat: migrate to monorepo structure"
git push origin main
```

## Step 8: Archive Old Repos

For each old repo:

1. Go to repo settings
2. Scroll to "Danger Zone"
3. Click "Archive this repository"
4. Add a README note pointing to the new monorepo

## Step 9: Update Consumers

Any projects using these packages will need to update their .npmrc:

```
@stridetime:registry=https://npm.pkg.github.com
```

The package names remain the same, so no code changes needed!

## Benefits After Migration

✅ Single source of truth
✅ Coordinated versioning
✅ Simplified CI/CD
✅ Easier cross-package changes
✅ Better dependency management
✅ Unified changelog
