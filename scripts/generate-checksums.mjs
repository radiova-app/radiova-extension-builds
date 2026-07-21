import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { sha256, ZIP_PATTERN } from './release-utils.mjs';

export function generateChecksums(releasePath) {
  const resolvedPath = resolve(releasePath);

  if (!existsSync(resolvedPath)) {
    console.error(`Error: Release directory not found: ${resolvedPath}`);
    process.exit(1);
  }

  const browsers = readdirSync(resolvedPath, { withFileTypes: true })
    .filter(d => d.isDirectory());

  let found = 0;

  for (const browser of browsers) {
    const browserPath = join(resolvedPath, browser.name);
    const files = readdirSync(browserPath);

    const zipFiles = files.filter(f => ZIP_PATTERN.test(f) && f.endsWith('.zip'));

    if (zipFiles.length === 0) {
      continue;
    }

    const checksums = [];

    for (const zipFile of zipFiles) {
      const zipPath = join(browserPath, zipFile);
      try {
        const hash = sha256(zipPath);
        checksums.push(`${hash}  ${zipFile}`);
        console.log(`  checksum ${zipFile}: ${hash}`);
        found++;
      } catch (err) {
        console.error(`  error reading ${zipFile}: ${err.message}`);
      }
    }

    if (checksums.length > 0) {
      const sumsPath = join(browserPath, 'SHA256SUMS.txt');
      writeFileSync(sumsPath, checksums.join('\n') + '\n');
      console.log(`  wrote SHA256SUMS.txt to ${browserPath}`);
    }
  }

  if (found === 0) {
    console.warn(`Warning: No valid ZIP files found in ${resolvedPath}`);
  }
}

// CLI entry point
const isMain = process.argv[1] && (
  process.argv[1].endsWith('generate-checksums.mjs')
);

if (isMain) {
  const targetDir = process.argv[2];

  if (!targetDir) {
    console.error('Usage: node scripts/generate-checksums.mjs <path-to-release-dir>');
    console.error('Example: node scripts/generate-checksums.mjs releases/v1.0.0');
    process.exit(1);
  }

  generateChecksums(targetDir);
}
