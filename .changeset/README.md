# Changesets

This folder contains changeset files that describe changes to packages in this monorepo.

## How to use

When you make changes to packages, run:

```bash
yarn changeset
```

This will prompt you to:
1. Select which packages changed
2. Choose the bump type (major/minor/patch)
3. Write a summary of the changes

The changeset will be committed with your changes.

When ready to release:

```bash
yarn version  # Updates versions and CHANGELOG
yarn release  # Builds and publishes packages
```

## Fixed Versioning

All packages in this monorepo use fixed versioning, meaning:
- **Major bumps**: All packages bump together (e.g., 0.x.x → 1.0.0)
- **Minor/Patch bumps**: Only changed packages bump independently
