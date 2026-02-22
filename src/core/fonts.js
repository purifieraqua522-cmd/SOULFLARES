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

function registerFontAlias(filePath, alias, loaded) {
  if (!fs.existsSync(filePath)) return;
  try {
    GlobalFonts.registerFromPath(filePath, alias);
    loaded.push({ family: alias, filePath });
  } catch (error) {
    logWarn('Failed to register aliased font', { alias, filePath, error: error.message });
  }
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

  // Strong defaults for PNG rendering, if files exist.
  registerFontAlias(path.join(localFontsDir, 'BebasNeue-Regular.ttf'), 'SOULFALRES Display', loaded);
  registerFontAlias(path.join(localFontsDir, 'Rajdhani-Bold.ttf'), 'SOULFALRES Battle', loaded);
  registerFontAlias(path.join(localFontsDir, 'Rajdhani-Medium.ttf'), 'SOULFALRES UI', loaded);

  if (!loaded.length) {
    logWarn('No custom fonts registered. Using canvas/system fallback fonts.');
  } else {
    logInfo('Custom fonts registered', { count: loaded.length });
  }

  const families = {
    display: env.CARD_FONT_FAMILY || 'SOULFALRES Display',
    battle: env.BOSS_FONT_FAMILY || 'SOULFALRES Battle',
    ui: env.PRIMARY_FONT_FAMILY || 'SOULFALRES UI'
  };

  return { loaded, families };
}

module.exports = { registerFonts };
