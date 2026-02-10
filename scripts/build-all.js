#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const packagesDir = join(__dirname, '..', 'packages');

// Build order based on dependencies
const buildOrder = ['types', 'db', 'test-utils', 'core', 'ui'];

console.log(`Building packages in order: ${buildOrder.join(' → ')}`);

for (const pkg of buildOrder) {
  const pkgPath = join(packagesDir, pkg);
  const pkgJsonPath = join(pkgPath, 'package.json');
  
  if (!existsSync(pkgJsonPath)) {
    console.log(`Skipping ${pkg} (no package.json)`);
    continue;
  }
  
  console.log(`\nBuilding ${pkg}...`);
  try {
    // Run yarn install first to ensure workspace is linked, then build
    execSync('yarn install --no-immutable && yarn build', { 
      cwd: pkgPath, 
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    console.log(`✓ ${pkg} built successfully`);
  } catch (error) {
    console.error(`✗ ${pkg} build failed`);
    process.exit(1);
  }
}

console.log('\n✓ All packages built successfully!');
