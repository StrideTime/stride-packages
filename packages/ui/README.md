# Stride UI Library

A shared component library for Stride's desktop, mobile, and landing page applications. This monorepo contains reusable React components, themes, and design tokens built with Material-UI (MUI).

## Packages

This monorepo contains the following packages:

- **[@stridetime/branding](./packages/branding)** - Logo components and brand assets
- **[@stridetime/theme](./packages/theme)** - MUI theme configuration with light/dark mode support

## Installation

### Prerequisites

1. You must authenticate with GitHub Package Registry to install these packages
2. Create a GitHub Personal Access Token with `read:packages` scope
3. Configure your `.npmrc` file (see below)

### Setting up Authentication

Copy the example `.npmrc` file and add your GitHub token:

```bash
cp .npmrc.example .npmrc
```

Then edit `.npmrc` and replace `${GITHUB_TOKEN}` with your actual token, or set the `GITHUB_TOKEN` environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

### Installing Packages

```bash
npm install @stridetime/branding
npm install @stridetime/theme
```

Or with Yarn:

```bash
yarn add @stridetime/branding
yarn add @stridetime/theme
```

## Quick Start

### Using the Theme

```tsx
import { ThemeProvider } from "@stridetime/theme";
import { Logo } from "@stridetime/branding";

function App() {
  return (
    <ThemeProvider>
      <Logo sx={{ width: 100, height: 40 }} />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Components

```tsx
import { Logo, LogoFull } from "@stridetime/branding";

function Header() {
  return (
    <header>
      <Logo sx={{ width: 50, height: 50 }} />
      <LogoFull sx={{ width: 150, height: 50 }} />
    </header>
  );
}
```

## Development

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Watch mode for development
yarn dev
```

### Project Structure

```
stride-ui/
├── packages/
│   ├── branding/          # Logo components and brand assets
│   └── theme/             # MUI theme configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .nvmrc                 # Node version specification
└── package.json           # Root package.json with workspace scripts
```

### Scripts

- `yarn build` - Build all packages
- `yarn clean` - Remove all dist folders
- `yarn lint` - Lint all packages
- `yarn test` - Run tests (placeholder)

### Publishing

Packages are published to GitHub Package Registry. To publish a new version:

1. Update the version in the package's `package.json`
2. Build the package: `yarn build`
3. Publish: `npm publish` (from the package directory)

## Version Management

This project uses semantic versioning (semver):

- **Patch** (0.1.x): Bug fixes, minor changes
- **Minor** (0.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

See individual package CHANGELOGs for version history.

## Contributing

### Code Style

- We use ESLint and Prettier for code formatting
- Run `yarn lint` before committing
- Follow existing patterns in the codebase

### Workflow

1. Make changes to the relevant package
2. Test locally using `yarn link` or in a consuming application
3. Run `yarn build` to ensure packages build correctly
4. Run `yarn lint` to check for linting errors
5. Update the package's CHANGELOG.md
6. Bump the version in package.json
7. Commit and push your changes

## Package Documentation

For detailed documentation on each package, see:

- [Branding Package](./packages/branding/README.md)
- [Theme Package](./packages/theme/README.md)

## Requirements

- Node.js 18+ (see `.nvmrc`)
- Yarn workspaces
- React 19+
- Material-UI 7+

## License

MIT
