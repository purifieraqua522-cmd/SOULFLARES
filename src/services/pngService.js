const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

function rarityColor(rarity) {
  if (rarity === 'secret') return '#ff2e63';
  if (rarity === 'mythical') return '#00d4ff';
  if (rarity === 'legendary') return '#f7b801';
  return '#7f5af0';
}

function findFirstExisting(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveCardBackground(anime) {
  const root = path.resolve(process.cwd(), 'assets/backgrounds/cards');
  return findFirstExisting([path.join(root, `${anime}.png`), path.join(root, 'default.png')]);
}

async function drawCardArtwork(ctx, imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) return;
  let image;
  try {
    image = await loadImage(imagePath);
  } catch {
    return;
  }

  const artX = 470;
  const artY = 40;
  const artW = 390;
  const artH = 420;

  ctx.save();
  ctx.beginPath();
  ctx.rect(artX, artY, artW, artH);
  ctx.clip();
  ctx.drawImage(image, artX, artY, artW, artH);
  ctx.restore();

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.strokeRect(artX, artY, artW, artH);
}

async function generateCardPng({ card, ownerTag, power, ascension, customName, imagePath, fontFamily = 'sans-serif' }) {
  const canvas = createCanvas(900, 500);
  const ctx = canvas.getContext('2d');

  const bgPath = resolveCardBackground(card.anime);
  if (bgPath) {
    try {
      const bg = await loadImage(bgPath);
      ctx.drawImage(bg, 0, 0, 900, 500);
    } catch {
      const grad = ctx.createLinearGradient(0, 0, 900, 500);
      grad.addColorStop(0, '#0b1020');
      grad.addColorStop(1, '#1f2937');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 500);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, 900, 500);
    grad.addColorStop(0, '#0b1020');
    grad.addColorStop(1, '#1f2937');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 500);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, 500);
  overlay.addColorStop(0, 'rgba(15,23,42,0.30)');
  overlay.addColorStop(1, 'rgba(2,6,23,0.72)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, 900, 500);

  ctx.fillStyle = rarityColor(card.rarity);
  ctx.fillRect(0, 0, 900, 12);

  await drawCardArtwork(ctx, imagePath);

  const title = customName?.trim() || card.display_name;

  ctx.font = `700 44px ${fontFamily}, sans-serif`;
  ctx.fillStyle = '#f9fafb';
  ctx.fillText(title, 44, 84);

  ctx.font = `500 26px ${fontFamily}, sans-serif`;
  ctx.fillStyle = '#93c5fd';
  ctx.fillText(`Anime: ${card.anime.toUpperCase()}`, 44, 132);

  ctx.fillStyle = '#d1d5db';
  ctx.fillText(`Rarity: ${card.rarity.toUpperCase()}`, 44, 178);
  ctx.fillText(`Power: ${power}`, 44, 224);
  ctx.fillText(`Ascension: +${ascension}`, 44, 270);

  ctx.font = `500 22px ${fontFamily}, sans-serif`;
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(`Owner: ${ownerTag}`, 44, 468);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 860, 460);

  return canvas.toBuffer('image/png');
}

module.exports = { generateCardPng };
