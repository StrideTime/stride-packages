# Stride Packages Monorepo

This monorepo contains all Stride packages managed with Yarn workspaces and Changesets.

## Packages

- **@stridetime/types** - Shared TypeScript types and enums
- **@stridetime/db** - Database layer with Drizzle ORM
- **@stridetime/core** - Business logic and services
- **@stridetime/ui** - React UI components
- **@stridetime/test-utils** - Shared testing utilities

## Getting Started

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Type check
yarn typecheck
```

## Development Workflow

### Making Changes

1. Make your changes in the relevant package(s)
2. Create a changeset:
   ```bash
   yarn changeset
   ```
3. Commit your changes including the changeset file
4. Create a PR

### Versioning Strategy

All packages use **fixed versioning**:
- **Major bumps**: All packages bump together (breaking changes)
- **Minor/Patch bumps**: Only changed packages bump

### Branch Strategy

- **main**: Production releases (v1.x.x)
- **beta**: Beta releases (v2.x.x)
- **alpha**: Alpha releases (v3.x.x)

### Publishing

Publishing happens automatically via GitHub Actions when you push to main/beta/alpha:

1. **With changeset**: Versions and publishes automatically
2. **Without changeset** (hotfix): Auto-creates a patch changeset

## Package Structure

```
stride-packages/
├── packages/
│   ├── types/          # @stridetime/types
│   ├── db/             # @stridetime/db
│   ├── core/           # @stridetime/core
│   ├── ui/             # @stridetime/ui
│   └── test-utils/     # @stridetime/test-utils
├── .changeset/         # Changeset configuration
├── .github/            # CI/CD workflows
└── package.json        # Root package.json
```

## Commands

- `yarn build` - Build all packages
- `yarn clean` - Clean all build outputs
- `yarn lint` - Lint all packages
- `yarn typecheck` - Type check all packages
- `yarn test` - Run all tests
- `yarn changeset` - Create a new changeset
- `yarn version` - Version packages based on changesets
- `yarn release` - Build and publish packages
