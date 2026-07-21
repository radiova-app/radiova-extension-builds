# Releases

This directory contains versioned release packages of the Radiova browser extension.

## Structure

Each release follows this layout:

```
releases/
└── v1.0.0/
    ├── chrome/
    │   ├── radiova-chrome-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── edge/
    │   ├── radiova-edge-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── firefox/
    │   ├── radiova-firefox-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── opera/
    │   ├── radiova-opera-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── brave/
    │   ├── radiova-brave-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── vivaldi/
    │   ├── radiova-vivaldi-v1.0.0.zip
    │   └── SHA256SUMS.txt
    ├── release-notes.md
    ├── release-notes.uk.md
    └── release-manifest.json
```

Not all browsers must be present in every release. Only actually built browsers are included.

## Preparing a new release

```sh
# 1. Build the extension in the private project
cd ../radiova-platform-private
pnpm build:extension

# 2. Prepare the release in this repository
cd ../radiova-extension-builds
npm run prepare:release -- v1.0.0
```

The `prepare:release` script will:
1. Find builds from `.output` in the private project
2. Copy and rename ZIP files
3. Generate checksums
4. Validate the release
5. Update `latest.json`

## Re-checking an existing release

```sh
npm run release:check -- releases/v1.0.0
```

## Current releases

*No releases yet.*
