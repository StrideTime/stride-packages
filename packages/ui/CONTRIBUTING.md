# Contributing to Stride UI

This guide explains the development workflow for the Stride UI monorepo.

## Repository Structure

```
stride-ui/
├── packages/
│   ├── branding/          # Brand colors, themes, and design tokens
│   └── [future packages]
├── .changeset/            # Changeset configuration and pending releases
└── package.json           # Root workspace configuration
```

## Development Workflow

### Setting Up

```bash
# Clone the repository
git clone <repository-url>
cd stride-ui

# Install dependencies
yarn install

# Build all packages
yarn build
```

### Working on Packages

Each package has its own scripts:

```bash
cd packages/branding

# Start development mode (watches for changes and rebuilds)
yarn dev

# Build the package
yarn build

# Run linter
yarn lint

# Run tests
yarn test

# Clean build artifacts
yarn clean
```

### Testing Changes Locally with `yarn link`

When developing a package that you want to test in another application (e.g., `stride-desktop`):

**Step 1: Link the package**
```bash
# In the package directory
cd packages/branding
yarn link

# This registers @stridetime/branding globally on your machine
```

**Step 2: Use the linked package in your app**
```bash
# In your consuming application
cd /path/to/stride-desktop
yarn link "@stridetime/branding"
```

**Step 3: Development loop**
```bash
# Terminal 1: Watch and rebuild the package
cd packages/branding
yarn dev

# Terminal 2: Run your consuming application
cd /path/to/stride-desktop
yarn dev
```

Changes to the package will automatically rebuild and be available in your app.

**Step 4: Unlink when done**
```bash
# In your consuming application
cd /path/to/stride-desktop
yarn unlink "@stridetime/branding"
yarn install --force  # Reinstall the published version
```

## Publishing Workflow

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs.

### Step 1: Make Your Changes

Make code changes to any package(s) as needed.

### Step 2: Create a Changeset

After making changes, document what changed:

```bash
yarn changeset
```

This interactive prompt will ask:

1. **Which packages changed?** (Use arrow keys and space to select)
   - Select the packages you modified (e.g., `@stridetime/branding`)

2. **What type of change is this?**
   - `patch` - Bug fixes, minor updates (0.1.15 → 0.1.16)
   - `minor` - New features, backwards-compatible (0.1.15 → 0.2.0)
   - `major` - Breaking changes (0.1.15 → 1.0.0)

3. **Write a summary of the changes**
   - This becomes the changelog entry
   - Be clear and concise

This creates a **temporary** markdown file in `.changeset/` (like `thirty-lemons-sort.md`) that tracks your changes. This file doesn't update the CHANGELOG yet - that happens in the next step when you're ready to release.

### Step 3: Commit Your Changes

```bash
git add .
git commit -m "feat: add new color tokens"
git push
```

The changeset file should be committed with your changes.

### Step 4: Release (Maintainers Only)

When ready to publish new versions:

```bash
# Update package.json versions and generate CHANGELOGs
npx changeset version

# This will:
# - Read all the .md files in .changeset/
# - Update each package's CHANGELOG.md with the changes
# - Bump the version in each package's package.json
# - Delete the temporary .changeset/*.md files

# Review the changes (check package.json and CHANGELOG.md files)
git diff

# Build and publish to GitHub Package Registry
yarn release

# Commit the version updates
git add .
git commit -m "chore: release packages"
git push
```

**Note:** Use `npx changeset version` instead of `yarn version` because Yarn has its own built-in version command that conflicts with the changeset script.

### Versioning Guide

Follow [Semantic Versioning](https://semver.org/):

- **Major (1.0.0 → 2.0.0)**: Breaking changes that require updates in consuming apps
  - Example: Renaming exported functions, removing features, changing APIs

- **Minor (1.0.0 → 1.1.0)**: New features that are backwards-compatible
  - Example: Adding new color tokens, new components

- **Patch (1.0.0 → 1.0.1)**: Bug fixes and minor improvements
  - Example: Fixing color values, updating documentation

## Package Registry

Packages are published to GitHub Package Registry under the `@stridetime` scope.

### Authentication

To install packages from GitHub Package Registry:

```bash
# Create a .npmrc file in your project or home directory
echo "@stridetime:registry=https://npm.pkg.github.com" >> .npmrc

# Authenticate with GitHub (requires a personal access token with read:packages scope)
npm login --scope=@stridetime --registry=https://npm.pkg.github.com
```

### Publishing Requirements

To publish packages, you need:

1. Write access to the repository
2. A GitHub personal access token with `write:packages` scope
3. Authentication configured in your `.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@stridetime:registry=https://npm.pkg.github.com
```

## Code Quality

### Linting

```bash
# Lint all packages
yarn lint

# Lint a specific package
cd packages/branding
yarn lint
```

### Testing

```bash
# Run all tests
yarn test

# Run tests for a specific package
cd packages/branding
yarn test
```

## Adding a New Package

1. Create a new directory under `packages/`
2. Copy the structure from an existing package (e.g., `branding`)
3. Update the package name in `package.json` to `@stridetime/package-name`
4. Ensure the package has:
   - `src/` directory with TypeScript source
   - `tsconfig.json` with proper configuration
   - Build scripts in `package.json`
   - Proper exports configuration
   - README.md with usage documentation

## Common Commands Reference

```bash
# Root-level commands (run from stride-ui/)
yarn build              # Build all packages
yarn clean              # Clean all build artifacts
yarn lint               # Lint all packages
yarn test               # Run all tests
yarn changeset          # Create a new changeset (temporary .md file)
npx changeset version   # Apply changesets and update CHANGELOGs/versions
yarn release            # Build and publish all packages

# Package-level commands (run from packages/*)
yarn dev            # Watch mode for development
yarn build          # Build the package
yarn clean          # Clean build artifacts
yarn lint           # Lint the package
yarn test           # Run package tests
```

## Getting Help

- Check existing issues for known problems
- Open a new issue for bugs or feature requests
- Review package READMEs for specific usage documentation

## License

See the LICENSE file in the repository root.
