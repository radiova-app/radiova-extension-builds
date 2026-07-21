import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import { generateChecksums } from './generate-checksums.mjs';
import { validateRelease } from './validate-release.mjs';
import { updateLatest } from './update-latest.mjs';
import { VERSION_PATTERN, WXT_BROWSER_MAP, SUPPORTED_BROWSERS, sha256 } from './release-utils.mjs';

const DEFAULT_PRIVATE_REPO = '../radiova-platform-private';
const RELEASES_DIR = 'releases';
const LATEST_JSON = 'latest.json';

function parseArgs() {
  const args = process.argv.slice(2);
  let version = null;
  let force = false;
  let privateRepo = DEFAULT_PRIVATE_REPO;

  for (const arg of args) {
    if (arg === '--force') {
      force = true;
    } else if (arg.startsWith('--private-repo=')) {
      privateRepo = arg.split('=')[1];
    } else if (!arg.startsWith('--') && version === null) {
      version = arg;
    }
  }

  return { version, force, privateRepo };
}

function findWxtBuilds(outputPath) {
  const builds = {};

  if (!existsSync(outputPath)) {
    return builds;
  }

  const entries = readdirSync(outputPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const browserName = WXT_BROWSER_MAP[entry.name];
    if (!browserName) continue;

    const dirPath = join(outputPath, entry.name);
    const files = readdirSync(dirPath);

    const zipFile = files.find(f => f.endsWith('.zip'));
    if (zipFile) {
      builds[browserName] = { path: join(dirPath, zipFile), name: zipFile };
    }
  }

  return builds;
}

function findPrivateReleasesBuilds(releasesExtensionPath) {
  const builds = {};

  if (!existsSync(releasesExtensionPath)) {
    return builds;
  }

  const entries = readdirSync(releasesExtensionPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!SUPPORTED_BROWSERS.includes(entry.name)) continue;

    const dirPath = join(releasesExtensionPath, entry.name);
    const files = readdirSync(dirPath);

    const zipFile = files.find(f => f.endsWith('.zip'));
    if (zipFile) {
      builds[entry.name] = { path: join(dirPath, zipFile), name: zipFile };
    }
  }

  return builds;
}

function createReleaseNotes(versionDir, version) {
  const enPath = join(versionDir, 'release-notes.md');
  const ukPath = join(versionDir, 'release-notes.uk.md');

  if (!existsSync(enPath)) {
    const en = [
      `# Radiova ${version}`,
      '',
      `Release date: ${new Date().toISOString().split('T')[0]}`,
      '',
      '## Added',
      '',
      '## Changed',
      '',
      '## Fixed',
      '',
      '## Known issues',
      '',
      '## Supported browsers',
      '- Chrome',
      '- Edge',
      '- Firefox',
      '- Opera',
      '- Brave',
      '- Vivaldi',
      '',
    ].join('\n');
    writeFileSync(enPath, en);
        console.log(`  -> Created release-notes.md`);
  }

  if (!existsSync(ukPath)) {
    const uk = [
      `# Radiova ${version}`,
      '',
      `Дата релізу: ${new Date().toISOString().split('T')[0]}`,
      '',
      '## Додано',
      '',
      '## Змінено',
      '',
      '## Виправлено',
      '',
      '## Відомі проблеми',
      '',
      '## Підтримувані браузери',
      '- Chrome',
      '- Edge',
      '- Firefox',
      '- Opera',
      '- Brave',
      '- Vivaldi',
      '',
    ].join('\n');
    writeFileSync(ukPath, uk);
        console.log(`  -> Created release-notes.uk.md`);
  }
}

function createReleaseManifest(versionDir, version, copiedBrowsers) {
  const manifest = {
    version,
    createdAt: new Date().toISOString(),
    browsers: {},
  };

  for (const [browser, info] of Object.entries(copiedBrowsers)) {
    const filePath = join(versionDir, browser, info.destName);
    if (existsSync(filePath)) {
      manifest.browsers[browser] = {
        file: `${browser}/${info.destName}`,
        sha256: sha256(filePath),
        size: statSync(filePath).size,
      };
    }
  }

  const manifestPath = join(versionDir, 'release-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  -> Created release-manifest.json`);
}

function prepareRelease({ version, force, privateRepo }) {
  const privateRepoPath = resolve(privateRepo);

  console.log(`\n=== Radiova Release Preparation ===`);
  console.log(`  Version:      ${version}`);
  console.log(`  Private repo: ${privateRepoPath}`);
  console.log(`  Force mode:   ${force}\n`);

  // 1. Validate version
  if (!VERSION_PATTERN.test(version)) {
    console.error(`Error: Invalid version format "${version}". Expected vX.Y.Z (e.g. v1.0.0)`);
    process.exit(1);
  }

  // 2. Check private repo
  if (!existsSync(privateRepoPath)) {
    console.error(`Error: Private repository not found at: ${privateRepoPath}`);
    console.error('  Use --private-repo=<path> to specify the correct location.');
    process.exit(1);
  }

  // 3. Find builds from .output (primary) and releases/extension (fallback)
  const wxtOutputPath = join(privateRepoPath, '.output');
  const privateReleasesPath = join(privateRepoPath, 'releases', 'extension');

  const wxtBuilds = findWxtBuilds(wxtOutputPath);
  const privateBuilds = findPrivateReleasesBuilds(privateReleasesPath);

  const allBuilds = { ...privateBuilds, ...wxtBuilds };

  if (Object.keys(allBuilds).length === 0) {
    if (existsSync(wxtOutputPath)) {
      console.error(`Error: No browser builds found in .output or releases/extension.`);
      console.error(`  Looked in:`);
      console.error(`    - ${wxtOutputPath}`);
      console.error(`    - ${privateReleasesPath}`);
    } else {
      console.error(`Error: No builds found. The extension has not been built yet.`);
      console.error(`  Expected WXT output directory: ${wxtOutputPath}`);
      console.error(`  (The directory does not exist. Build the extension first.)`);
    }
    process.exit(1);
  }

  console.log(`Found ${Object.keys(allBuilds).length} browser build(s):`);
  for (const [browser, info] of Object.entries(allBuilds)) {
    console.log(`  - ${browser}: ${info.path}`);
  }

  // 4. Create release directory
  const releaseDir = resolve(join(RELEASES_DIR, version));

  if (existsSync(releaseDir)) {
    if (!force) {
      console.error(`\nError: Release directory already exists: ${releaseDir}`);
      console.error('  Use --force to overwrite an existing release.');
      process.exit(1);
    }
    console.log(`\nWarning: Release directory exists. Overwriting (--force enabled).`);
  }

  // 5. Copy ZIP files
  const versionNum = version.replace(/^v/, '');
  const copied = {};
  const skipped = [];
  const missing = [];

  for (const browser of SUPPORTED_BROWSERS) {
    if (allBuilds[browser]) {
      const browserDir = join(releaseDir, browser);
      mkdirSync(browserDir, { recursive: true });

      const destName = `radiova-${browser}-${version}.zip`;
      const destPath = join(browserDir, destName);

      try {
        copyFileSync(allBuilds[browser].path, destPath);
        copied[browser] = { ...allBuilds[browser], destName };
        console.log(`  [OK] ${browser}: copied -> ${destName}`);
      } catch (err) {
        console.error(`  [FAIL] ${browser}: copy failed - ${err.message}`);
        skipped.push(browser);
      }
    } else {
      missing.push(browser);
    }
  }

  if (copied.length === 0) {
    console.error('\nError: No builds were copied. Aborting.');
    process.exit(1);
  }

  if (missing.length > 0) {
    console.log(`\n  Missing browsers: ${missing.join(', ')}`);
  }

  // 6. Create release notes
  createReleaseNotes(releaseDir, version);

  // 7. Create release manifest
  createReleaseManifest(releaseDir, version, copied);

  // 8. Generate checksums
  console.log(`\n--- Generating checksums ---`);
  generateChecksums(releaseDir);

  // 9. Validate release
  console.log(`\n--- Validating release ---`);
  validateRelease(releaseDir);

  // 10. Update latest.json
  console.log(`\n--- Updating latest.json ---`);
  updateLatest(releaseDir);

  // 11. Summary
  console.log(`\n=== Release ${version} prepared successfully ===`);
  console.log(`  Location: ${releaseDir}`);
  console.log(`  Browsers: ${Object.keys(copied).join(', ')}`);

  if (missing.length > 0) {
    console.log(`  Missing:  ${missing.join(', ')}`);
  }
}

const { version, force, privateRepo } = parseArgs();

if (!version) {
  console.error('Usage: node scripts/prepare-release.mjs <version> [--force] [--private-repo=<path>]');
  console.error('');
  console.error('Arguments:');
  console.error('  <version>             Version label (required). Format: vX.Y.Z');
  console.error('  --force               Overwrite existing release directory');
  console.error('  --private-repo=<path> Path to the private project (default: ../radiova-platform-private)');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/prepare-release.mjs v1.0.0');
  console.error('  node scripts/prepare-release.mjs v1.0.0 --force');
  console.error('  node scripts/prepare-release.mjs v1.0.0 --private-repo=../radiova-platform-private');
  process.exit(1);
}

prepareRelease({ version, force, privateRepo });
