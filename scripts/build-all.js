#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, unlinkSync } = require('fs');
const { join } = require('path');

const rootDir = join(__dirname, '..');
const packagesDir = join(rootDir, 'packages');

// Build order based on dependencies
const buildOrder = ['types', 'db', 'test-utils', 'core', 'ui'];

console.log(`Building packages in order: ${buildOrder.join(' → ')}`);

// Run pnpm install at root
console.log('\nInstalling dependencies...');
try {
  execSync('pnpm install', { 
    cwd: rootDir, 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });
} catch (error) {
  console.error('✗ Failed to install dependencies');
  process.exit(1);
}

// Now build each package
for (const pkg of buildOrder) {
  const pkgPath = join(packagesDir, pkg);
  const pkgJsonPath = join(pkgPath, 'package.json');
  
  if (!existsSync(pkgJsonPath)) {
    console.log(`Skipping ${pkg} (no package.json)`);
    continue;
  }
  
  console.log(`\nBuilding ${pkg}...`);
  try {
    execSync('pnpm run build', { 
      cwd: pkgPath, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    console.log(`✓ ${pkg} built successfully`);
  } catch (error) {
    console.error(`✗ ${pkg} build failed`);
    process.exit(1);
  }
}

console.log('\n✓ All packages built successfully!');
