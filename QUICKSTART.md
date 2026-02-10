# Quick Start Guide

## Prerequisites

- Node.js 20+
- Yarn 4.x
- All stride packages cloned in the parent directory

## Step-by-Step Migration

### 1. Create the GitHub Repository

```bash
# Create new repo
gh repo create stridetime/stride-packages --public --description "Monorepo for all Stride packages"

# Clone it
git clone https://github.com/stridetime/stride-packages.git
cd stride-packages
```

### 2. Copy Monorepo Structure

The monorepo structure has been created in `stride-packages/`. Copy all files to your new repo:

```bash
# From your current location
cp -r stride-packages/* /path/to/your/cloned/stride-packages/
cd /path/to/your/cloned/stride-packages/
```

### 3. Run Migration Script

Ensure all individual package repos are cloned in the parent directory:

```
parent-dir/
├── stride-packages/     # Your new monorepo
├── stride-types/        # Existing repo
├── stride-db/           # Existing repo
├── stride-core/         # Existing repo
├── stride-ui/           # Existing repo
└── stride-test-utils/   # Existing repo
```

Then run:

```bash
./scripts/migrate-packages.sh
```

### 4. Sync Versions

Choose a starting version (e.g., 1.0.0) and sync all packages:

```bash
./scripts/sync-versions.sh 1.0.0
```

### 5. Install Dependencies

```bash
yarn install
```

### 6. Build and Test

```bash
# Build all packages
yarn build

# Run tests
yarn test

# Lint
yarn lint

# Type check
yarn typecheck
```

### 7. Create Initial Changeset

```bash
yarn changeset
# Select all packages
# Choose "major" for version 1.0.0
# Summary: "Initial monorepo release"
```

### 8. Commit and Push

```bash
git add .
git commit -m "feat: initial monorepo setup"
git push origin main
```

### 9. Archive Old Repositories

For each old repo (stride-types, stride-db, stride-core, stride-ui, stride-test-utils):

1. Go to Settings → General
2. Scroll to "Danger Zone"
3. Click "Archive this repository"
4. Update README to point to new monorepo:

```markdown
# ⚠️ This repository has been archived

This package is now maintained in the monorepo:
https://github.com/stridetime/stride-packages

Please use the monorepo for all future development.
```

## Daily Workflow

### Making Changes

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make changes in packages/
cd packages/core
# ... make changes ...

# 3. Create a changeset
cd ../..
yarn changeset

# 4. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 5. Create PR
gh pr create
```

### Publishing

Publishing happens automatically when you merge to main/beta/alpha:

- **main**: Stable releases (1.x.x)
- **beta**: Beta releases (2.x.x-beta.x)
- **alpha**: Alpha releases (3.x.x-alpha.x)

## Troubleshooting

### "Cannot find module @stridetime/..."

Run `yarn install` from the root to link workspace packages.

### Build errors

Ensure you build in dependency order:
```bash
yarn build
```

The root script handles this automatically.

### Version conflicts

All packages should be at the same major version. Use:
```bash
./scripts/sync-versions.sh <version>
```

## Benefits

✅ **Single source of truth** - All packages in one place
✅ **Coordinated versioning** - Major bumps affect all packages
✅ **Simplified CI/CD** - One workflow for all packages
✅ **Better DX** - Easy cross-package changes
✅ **Automatic dependency updates** - Workspace protocol handles it
