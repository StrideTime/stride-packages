# pnpm Setup Guide

## Local Setup

1. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
   # or
   brew install pnpm
   ```

2. **Clean up Yarn artifacts**:
   ```bash
   cd stride-packages
   rm -rf node_modules yarn.lock .yarn .yarnrc.yml
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Build all packages**:
   ```bash
   pnpm build
   ```

## Commands

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages in order
- `pnpm test` - Run tests in all packages
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm -r run <script>` - Run a script in all packages

## Why pnpm?

✅ **Fast** - Uses hard links and content-addressable storage
✅ **Efficient** - Saves disk space by sharing dependencies
✅ **Strict** - Better dependency resolution than npm/yarn
✅ **Workspace support** - Excellent monorepo support
✅ **Compatible** - Works with existing npm packages

## CI/CD

GitHub Actions will automatically:
1. Install pnpm via Corepack
2. Install dependencies
3. Build, test, and publish packages

No additional configuration needed!
