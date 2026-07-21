import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { VERSION_PATTERN, ZIP_PATTERN, SUPPORTED_BROWSERS } from './release-utils.mjs';

export function updateLatest(versionDir) {
  const resolvedDir = resolve(versionDir);

  if (!existsSync(resolvedDir)) {
    console.error(`Error: Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  const dirName = resolvedDir.split(/[\\/]/).pop();
  if (!VERSION_PATTERN.test(dirName)) {
    console.error(`Error: Invalid directory name "${dirName}". Expected vX.Y.Z`);
    process.exit(1);
  }

  const items = readdirSync(resolvedDir, { withFileTypes: true });
  const browserDirs = items.filter(d => d.isDirectory() && SUPPORTED_BROWSERS.includes(d.name));

  const downloads = {};
  const checksums = {};

  for (const browser of SUPPORTED_BROWSERS) {
    downloads[browser] = null;
    checksums[browser] = null;
  }

  for (const dir of browserDirs) {
    const browserPath = join(resolvedDir, dir.name);
    const files = readdirSync(browserPath);

    const zipFile = files.find(f => ZIP_PATTERN.test(f));
    if (zipFile) {
      downloads[dir.name] = `releases/${dirName}/${dir.name}/${zipFile}`;
    }

    const sumsFile = files.find(f => f === 'SHA256SUMS.txt');
    if (sumsFile && zipFile) {
      try {
        const sumsContent = readFileSync(join(browserPath, sumsFile), 'utf-8');
        const zipEntry = sumsContent.split('\n').find(line => line.includes(zipFile));
        if (zipEntry) {
          checksums[dir.name] = zipEntry.split(/\s+/)[0];
        }
      } catch {
        // ignore read errors
      }
    }
  }

  const latestJsonPath = resolve('latest.json');
  let currentData = {};

  if (existsSync(latestJsonPath)) {
    try {
      currentData = JSON.parse(readFileSync(latestJsonPath, 'utf-8'));
    } catch {
      console.warn('Warning: Could not parse existing latest.json, starting fresh');
    }
  }

  const updatedData = {
    ...currentData,
    version: dirName,
    publishedAt: new Date().toISOString(),
    releaseNotes: {
      en: currentData.releaseNotes?.en || null,
      uk: currentData.releaseNotes?.uk || null,
    },
    downloads: {
      ...currentData.downloads,
      ...downloads,
    },
    checksums: {
      ...currentData.checksums,
      ...checksums,
    },
  };

  writeFileSync(latestJsonPath, JSON.stringify(updatedData, null, 2) + '\n');
  console.log(`Updated latest.json with version ${dirName}`);
  console.log(`  Browsers found: ${browserDirs.map(d => d.name).join(', ') || 'none'}`);
}

// CLI entry point
const isMain = process.argv[1] && (
  process.argv[1].endsWith('update-latest.mjs')
);

if (isMain) {
  const targetVersion = process.argv[2];

  if (!targetVersion) {
    console.error('Usage: node scripts/update-latest.mjs <path-to-release-dir>');
    console.error('Example: node scripts/update-latest.mjs releases/v1.0.0');
    process.exit(1);
  }

  updateLatest(targetVersion);
}
