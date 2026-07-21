[Українська версія](README.uk.md)

# Radiova — Browser Extension Builds

Radiova is a browser extension that [brief description of what Radiova does — to be added by the project owner].

This repository contains **pre-built, signed, and ready-to-install** packages of the Radiova browser extension for multiple Chromium-based browsers and Firefox.

> **Note:** This repository is for **built releases only**. The source code is maintained in a private repository.

---

## Project Status

**Active development.** The latest stable release details are available in [releases](releases/).

---

## Supported Browsers

| Browser   | Based on       | Package                                     |
|-----------|----------------|---------------------------------------------|
| Chrome    | Chromium       | `radiova-chrome-v*.zip`                     |
| Edge      | Chromium       | `radiova-edge-v*.zip`                       |
| Brave     | Chromium       | `radiova-brave-v*.zip`                      |
| Opera     | Chromium       | `radiova-opera-v*.zip`                      |
| Vivaldi   | Chromium       | `radiova-vivaldi-v*.zip`                    |
| Firefox   | Gecko          | `radiova-firefox-v*.zip`                    |

---

## Latest Release

| Browser | Download | SHA-256 Checksum |
|---------|----------|-------------------|
| Chrome  | —        | —                 |
| Edge    | —        | —                 |
| Brave   | —        | —                 |
| Opera   | —        | —                 |
| Vivaldi | —        | —                 |
| Firefox | —        | —                 |

> See [releases/](releases/) for the full list of versions.

---

## Installation

### Manual Installation (Chrome, Edge, Brave, Opera, Vivaldi)

1. Download the ZIP file for your browser from the [releases](releases/) page.
2. Unzip the archive to a local folder.
3. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
   - Vivaldi: `vivaldi://extensions`
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the unzipped folder.
6. The extension is now installed.

### Firefox

1. Download `radiova-firefox-v*.zip` from the [releases](releases/) page.
2. Go to `about:addons` in Firefox.
3. Click the gear icon → **Install Add-on From File...**
4. Select the ZIP file.
5. Confirm the installation.

Alternatively, you can install the signed version from [Firefox Add-ons (AMO)](https://addons.mozilla.org) (link to be added when published).

---

## Verify SHA-256 Checksums

Each release includes a `SHA256SUMS.txt` file per browser. To verify integrity:

### Windows (PowerShell)
```powershell
Get-FileHash -Algorithm SHA256 radiova-chrome-v1.0.0.zip
```
Compare the output with the checksum in `SHA256SUMS.txt`.

### Linux / macOS
```sh
sha256sum -c SHA256SUMS.txt
```

---

## Directory Structure

```
radiova-extension-builds/
├── releases/                  # Versioned release packages
├── checksums/                 # Checksum archives
├── browsers/                  # Per-browser metadata
├── assets/                    # Icons, screenshots, branding
├── scripts/                   # Automation and validation tools
│   ├── prepare-release.mjs    # Full release preparation pipeline
│   ├── generate-checksums.mjs # SHA-256 checksum generation
│   ├── validate-release.mjs   # Release validation
│   ├── update-latest.mjs      # latest.json updater
│   └── release-utils.mjs      # Shared utilities
├── latest.json                # Latest version metadata (used by radiova-app.github.io)
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Support

For issues, questions, or feature requests, please open an issue in the [issue tracker](https://github.com/radiova-app/radiova-extension-builds/issues) (link to be created).

---

## Security

See [SECURITY.md](SECURITY.md) for instructions on reporting vulnerabilities.

---

## License

This repository's contents are distributed under the license defined in [LICENSE](LICENSE). The project owner must specify the appropriate license before first public release.

---

## Release Workflow

### Preparing a new release

1. Build the extension in the private project:
   ```sh
   cd ../radiova-platform-private
   pnpm build:extension
   ```

2. Prepare the release in this repository:
   ```sh
   cd ../radiova-extension-builds
   npm run prepare:release -- v1.0.0
   ```

3. Review the generated release notes in `releases/v1.0.0/release-notes.md` and `releases/v1.0.0/release-notes.uk.md`.

4. Verify `latest.json` reflects the new version.

5. Create a Git tag and GitHub Release (see below).

### Re-checking an existing release

```sh
npm run release:check -- releases/v1.0.0
```

### Creating a GitHub Release

After preparing a release and committing the changes:

1. Create a tag: `git tag v1.0.0`
2. Push: `git push --tags`
3. On GitHub, create a new Release:
   - **Tag:** `v1.0.0`
   - **Title:** `Radiova v1.0.0`
   - **Description:** Use the content from `releases/v1.0.0/release-notes.md` (English)
   - Include a link to the Ukrainian release notes: `[Українські нотатки](releases/v1.0.0/release-notes.uk.md)`
4. Attach the following files to the Release:
   - All `radiova-*-v1.0.0.zip` files from each browser directory
   - The `SHA256SUMS.txt` from each browser directory
5. Publish the Release.

## GitHub Pages

This repository is structured to serve as a source for the [radiova-app.github.io](https://radiova-app.github.io) website. Direct download links for release assets can be referenced from the `latest.json` file and the `releases/` directory.
