# Radiova v1.1.0
Release date: 2026-11-25

## Added
- Stations now come from the shared Radiova catalog (about 300 stations). The catalog is verified with a SHA-256 checksum, cached for offline use, and a bundled station list is kept as the last fallback.
- A Firefox build. Playback runs in the extension's background page there.

## Changed
- Your favorites, hidden stations, lists, last station and statistics are moved to the new catalog keys automatically. Stations that are not in the catalog stay available as before, and a backup of the previous values is saved first.
- The old online station source is no longer used.

## Fixed
- The dialogs for adding a Discover source and for editing the exclusions list in the dashboard.

## Known issues
- Sign-in with Google is not part of this release.
- The Firefox build has only been checked with automated tests, not in a real Firefox.

## Supported browsers
- Chrome
- Firefox
- Edge
- Brave
- Opera
- Vivaldi
