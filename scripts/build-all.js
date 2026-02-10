#!/usr/bin/env node
const { execSync } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const { join } = require('path');

const packagesDir = join(__dirname, '..', 'packages');
const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${packages.length} packages: ${packages.join(', ')}`);

for (const pkg of packages) {
  const pkgPath = join(packagesDir, pkg);
  const pkgJsonPath = join(pkgPath, 'package.json');
  
  if (!existsSync(pkgJsonPath)) {
    console.log(`Skipping ${pkg} (no package.json)`);
    continue;
  }
  
  console.log(`\nBuilding ${pkg}...`);
  try {
    execSync('npm run build', { 
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
