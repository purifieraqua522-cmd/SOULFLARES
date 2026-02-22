const fs = require('fs');
const path = require('path');
const { GlobalFonts } = require('@napi-rs/canvas');
const { logInfo, logWarn } = require('./logger');

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

function fontFamilyFromName(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim() || 'SOULFALRES Font';
}

function registerFonts(env = process.env) {
  const localFontsDir = path.resolve(process.cwd(), 'assets/fonts');
  const envFontDirs = (env.FONT_PATHS || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const allDirs = [localFontsDir, ...envFontDirs];
  const loaded = [];

  for (const dir of allDirs) {
    const files = walkFiles(dir).filter((filePath) => /\.(ttf|otf|woff|woff2)$/i.test(filePath));
    for (const filePath of files) {
      try {
        const family = fontFamilyFromName(filePath);
        GlobalFonts.registerFromPath(filePath, family);
        loaded.push({ family, filePath });
      } catch (error) {
        logWarn('Failed to register font', { filePath, error: error.message });
      }
    }
  }

  if (!loaded.length) {
    logWarn('No custom fonts registered. Using canvas/system fallback fonts.');
  } else {
    logInfo('Custom fonts registered', { count: loaded.length });
  }

  return loaded;
}

module.exports = { registerFonts };
