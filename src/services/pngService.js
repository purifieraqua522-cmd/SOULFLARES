const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

const defaultFont = path.join(__dirname, '../../assets/Orbitron-Regular.ttf');
if (fs.existsSync(defaultFont)) {
  GlobalFonts.registerFromPath(defaultFont, 'Orbitron');
}

function rarityColor(rarity) {
  if (rarity === 'secret') return '#ff2e63';
  if (rarity === 'mythical') return '#00d4ff';
  if (rarity === 'legendary') return '#f7b801';
  return '#7f5af0';
}

async function generateCardPng({ card, ownerTag, power, ascension }) {
  const canvas = createCanvas(900, 500);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 900, 500);
  grad.addColorStop(0, '#0b1020');
  grad.addColorStop(1, '#1f2937');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 900, 500);

  ctx.fillStyle = rarityColor(card.rarity);
  ctx.fillRect(0, 0, 900, 12);

  ctx.font = '700 44px Orbitron, sans-serif';
  ctx.fillStyle = '#f9fafb';
  ctx.fillText(card.display_name, 44, 84);

  ctx.font = '500 26px Orbitron, sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText(`Anime: ${card.anime.toUpperCase()}`, 44, 132);

  ctx.fillStyle = '#d1d5db';
  ctx.fillText(`Rarity: ${card.rarity.toUpperCase()}`, 44, 178);
  ctx.fillText(`Power: ${power}`, 44, 224);
  ctx.fillText(`Ascension: +${ascension}`, 44, 270);

  ctx.font = '500 22px Orbitron, sans-serif';
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(`Owner: ${ownerTag}`, 44, 468);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 860, 460);

  return canvas.toBuffer('image/png');
}

module.exports = { generateCardPng };
