import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { sha256, VERSION_PATTERN, ZIP_PATTERN } from './release-utils.mjs';

export function validateRelease(releasePath) {
  const resolvedPath = resolve(releasePath);
  let hasErrors = false;

  if (!existsSync(resolvedPath)) {
    console.error(`Error: Release directory not found: ${resolvedPath}`);
    process.exit(1);
  }

  const dirName = resolvedPath.split(/[\\/]/).pop();
  if (!VERSION_PATTERN.test(dirName)) {
    console.error(`Error: Invalid version directory name "${dirName}". Expected format: vX.Y.Z`);
    hasErrors = true;
  }

  const releaseNotesEn = join(resolvedPath, 'release-notes.md');
  const releaseNotesUk = join(resolvedPath, 'release-notes.uk.md');

  if (!existsSync(releaseNotesEn)) {
    console.warn(`Warning: release-notes.md not found`);
  }
  if (!existsSync(releaseNotesUk)) {
    console.warn(`Warning: release-notes.uk.md not found`);
  }

  const items = readdirSync(resolvedPath, { withFileTypes: true });
  const browserDirs = items.filter(d => d.isDirectory());

  if (browserDirs.length === 0) {
    console.warn('Warning: No browser directories found in release');
    return;
  }

  for (const dir of browserDirs) {
    const browserPath = join(resolvedPath, dir.name);
    const files = readdirSync(browserPath);

    const zipFiles = files.filter(f => f.endsWith('.zip'));
    const sumsFiles = files.filter(f => f === 'SHA256SUMS.txt');

    if (zipFiles.length === 0) {
      continue;
    }

    for (const zipFile of zipFiles) {
      const match = zipFile.match(ZIP_PATTERN);
      if (!match) {
        console.error(`Error: Invalid ZIP filename "${zipFile}". Expected format: radiova-{browser}-vX.Y.Z.zip`);
        hasErrors = true;
        continue;
      }

      const browserFromName = match[1];
      const versionFromName = match[2];

      if (browserFromName !== dir.name) {
        console.error(`Error: ZIP browser "${browserFromName}" does not match directory "${dir.name}"`);
        hasErrors = true;
      }

      if (versionFromName !== dirName.replace(/^v/, '')) {
        console.error(`Error: ZIP version "${versionFromName}" does not match directory version "${dirName}"`);
        hasErrors = true;
      }

      const zipPath = join(browserPath, zipFile);
      if (sumsFiles.length > 0) {
        const sumsPath = join(browserPath, 'SHA256SUMS.txt');
        try {
          const sumsContent = readFileSync(sumsPath, 'utf-8');
          const expectedHash = sumsContent
            .split('\n')
            .find(line => line.includes(zipFile))
            ?.split(/\s+/)[0];

          if (expectedHash) {
            const actualHash = sha256(zipPath);
            if (actualHash !== expectedHash) {
              console.error(`Error: Checksum mismatch for ${zipFile}`);
              console.error(`  Expected: ${expectedHash}`);
              console.error(`  Actual:   ${actualHash}`);
              hasErrors = true;
            } else {
              console.log(`  check ${zipFile}: checksum OK`);
            }
          } else {
            console.warn(`  ? ${zipFile}: checksum not found in SHA256SUMS.txt`);
          }
        } catch (err) {
          console.error(`  error for ${zipFile}: ${err.message}`);
          hasErrors = true;
        }
      } else {
        console.warn(`  ? ${zipFile}: no SHA256SUMS.txt found`);
      }
    }
  }

  if (hasErrors) {
    console.error('Validation failed.');
    process.exit(1);
  } else {
    console.log('Validation passed.');
  }
}

// CLI entry point
const isMain = process.argv[1] && (
  process.argv[1].endsWith('validate-release.mjs')
);

if (isMain) {
  const targetDir = process.argv[2];

  if (!targetDir) {
    console.error('Usage: node scripts/validate-release.mjs <path-to-release-dir>');
    console.error('Example: node scripts/validate-release.mjs releases/v1.0.0');
    process.exit(1);
  }

  validateRelease(targetDir);
}
