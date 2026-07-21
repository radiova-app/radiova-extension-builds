import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;
export const VERSION_NUM_PATTERN = /^\d+\.\d+\.\d+$/;

export const ZIP_PATTERN = /^radiova-(chrome|edge|firefox|opera|brave|vivaldi)-v(\d+\.\d+\.\d+)\.zip$/;

export const SUPPORTED_BROWSERS = ['chrome', 'edge', 'firefox', 'opera', 'brave', 'vivaldi'];

export const WXT_BROWSER_MAP = {
  'chrome-mv3': 'chrome',
  'firefox-mv3': 'firefox',
  'edge-mv3': 'edge',
  'opera-mv3': 'opera',
  'brave-mv3': 'brave',
  'vivaldi-mv3': 'vivaldi',
};

export function sha256(filePath) {
  const data = readFileSync(filePath);
  return createHash('sha256').update(data).digest('hex');
}

export function formatVersionError(version) {
  return `Invalid version "${version}". Expected format: vX.Y.Z (e.g. v1.0.0)`;
}
