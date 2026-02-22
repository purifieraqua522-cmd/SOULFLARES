const fs = require('fs');
const path = require('path');
const { logInfo } = require('../core/logger');

const supportedAnimes = new Set(['onepiece', 'naruto', 'bleach', 'jjk', 'secret']);

function toCardKey(raw) {
  return raw
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
}

function inferRarity(parts, fileName) {
  const lowerParts = parts.map((x) => x.toLowerCase());
  const lowerFile = fileName.toLowerCase();
  if (lowerParts.includes('secret') || /\bsecret\b/.test(lowerFile)) return 'secret';
  if (lowerParts.includes('mythical') || /\bmythical\b/.test(lowerFile)) return 'mythical';
  if (lowerParts.includes('legendary') || /\blegendary\b/.test(lowerFile)) return 'legendary';
  return 'epic';
}

function tierForRarity(rarity) {
  if (rarity === 'mythical' || rarity === 'secret') return 3;
  if (rarity === 'legendary') return 2;
  return 1;
}

function basePowerForRarity(rarity) {
  if (rarity === 'secret') return 4200;
  if (rarity === 'mythical') return 2500;
  if (rarity === 'legendary') return 1400;
  return 780;
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

function scanCardAssets(rootDir = path.resolve(process.cwd(), 'assets/cards')) {
  const files = walkFiles(rootDir).filter((filePath) => /\.(png|jpg|jpeg|webp)$/i.test(filePath));
  const cards = [];
  const imageMap = new Map();

  for (const filePath of files) {
    const rel = path.relative(rootDir, filePath);
    const parts = rel.split(path.sep);
    const anime = (parts[0] || '').toLowerCase();
    if (!supportedAnimes.has(anime)) continue;

    const fileName = path.basename(filePath, path.extname(filePath));
    const key = toCardKey(fileName);
    if (!key) continue;

    const rarity = inferRarity(parts, fileName);
    const displayName = fileName
      .replace(/\[[^\]]+\]/g, '')
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (m) => m.toUpperCase());

    cards.push({
      key,
      anime,
      display_name: displayName,
      rarity,
      base_power: basePowerForRarity(rarity),
      evolution_tier: tierForRarity(rarity),
      evolution_line: [key],
      secret: rarity === 'secret',
      fusion_only: false
    });

    imageMap.set(key, filePath);
  }

  return { cards, imageMap };
}

function createAssetsService(repos) {
  let cardImageMap = new Map();

  return {
    scanCardAssets,

    getCardImagePath(cardKey) {
      return cardImageMap.get(cardKey) || null;
    },

    async syncCardsFromAssets() {
      const { cards, imageMap } = scanCardAssets();
      cardImageMap = imageMap;
      if (!cards.length) {
        logInfo('No card assets found under assets/cards');
        return { scanned: 0, upserted: 0 };
      }

      await repos.upsertCards(cards);
      logInfo('Card assets synced to database', { count: cards.length });
      return { scanned: cards.length, upserted: cards.length };
    }
  };
}

module.exports = { createAssetsService, scanCardAssets };
