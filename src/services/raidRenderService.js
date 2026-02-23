const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

function firstExisting(paths) {
  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function resolveRaidBackground(raidKey, anime) {
  const root = path.resolve(process.cwd(), 'assets/backgrounds/raid');
  return firstExisting([
    path.join(root, `${raidKey}.png`),
    path.join(root, `${anime}_${raidKey}.png`),
    path.join(root, `${anime}.png`),
    path.join(root, 'default.png')
  ]);
}

function drawHp(ctx, x, y, w, h, hp, max) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, hp / max)) : 0;
  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(51,65,85,0.9)';
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(x + 2, y + 2, Math.floor((w - 4) * ratio), h - 4);
}

async function generateRaidLobbyPng({ raidKey, preset, state, fontFamily = 'sans-serif' }) {
  const width = 1500;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgPath = resolveRaidBackground(raidKey, preset.anime);
  if (bgPath) {
    try {
      const img = await loadImage(bgPath);
      ctx.drawImage(img, 0, 0, width, height);
    } catch {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, 'rgba(2,6,23,0.30)');
  overlay.addColorStop(1, 'rgba(2,6,23,0.82)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(15,23,42,0.72)';
  ctx.fillRect(40, 30, width - 80, 180);
  ctx.fillRect(40, 240, width - 80, 620);
  ctx.strokeStyle = 'rgba(148,163,184,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 30, width - 80, 180);
  ctx.strokeRect(40, 240, width - 80, 620);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 62px ${fontFamily}, sans-serif`;
  ctx.fillText(`${preset.label}`, 80, 108);
  ctx.fillStyle = '#93c5fd';
  ctx.font = `600 26px ${fontFamily}, sans-serif`;
  ctx.fillText(`Anime: ${preset.anime.toUpperCase()}  |  Stage ${state.stage_index + 1}/${preset.stages.length}`, 82, 154);

  drawHp(ctx, 80, 170, width - 160, 24, state.hp_current, state.hp_max);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `700 34px ${fontFamily}, sans-serif`;
  ctx.fillText(`Current Boss: ${state.boss_key}`, 80, 300);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `600 24px ${fontFamily}, sans-serif`;
  ctx.fillText(`HP ${state.hp_current}/${state.hp_max}`, 80, 338);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 30px ${fontFamily}, sans-serif`;
  ctx.fillText('Team Members', 80, 398);
  const users = Array.isArray(state.users) ? state.users : [];
  if (!users.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 24px ${fontFamily}, sans-serif`;
    ctx.fillText('No team yet. Press Team Create below.', 82, 438);
  } else {
    users.slice(0, 6).forEach((u, i) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `600 22px ${fontFamily}, sans-serif`;
      ctx.fillText(`${i + 1}. ${u}`, 82, 438 + i * 36);
    });
  }

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 30px ${fontFamily}, sans-serif`;
  ctx.fillText('Stage Order', 760, 398);
  preset.stages.forEach((stage, idx) => {
    ctx.fillStyle = idx === state.stage_index ? '#22d3ee' : '#cbd5e1';
    ctx.font = `600 22px ${fontFamily}, sans-serif`;
    const marker = idx === state.stage_index ? '>>' : '-';
    ctx.fillText(`${marker} ${idx + 1}. ${stage}`, 762, 438 + idx * 34);
  });

  return canvas.toBuffer('image/png');
}

module.exports = { generateRaidLobbyPng };
