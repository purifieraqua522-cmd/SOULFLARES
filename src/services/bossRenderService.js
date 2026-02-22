const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

function findFirstExisting(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveBossBackground({ anime, difficulty, defeated }) {
  const root = path.resolve(process.cwd(), 'assets/backgrounds/boss');
  const suffix = defeated ? '_defeated' : '';
  return findFirstExisting([
    path.join(root, `${anime}_${difficulty}${suffix}.png`),
    path.join(root, `${anime}${suffix}.png`),
    path.join(root, `${difficulty}${suffix}.png`),
    path.join(root, `default${suffix}.png`),
    path.join(root, `${anime}_${difficulty}.png`),
    path.join(root, `${anime}.png`),
    path.join(root, `${difficulty}.png`),
    path.join(root, 'default.png')
  ]);
}

function difficultyColor(difficulty) {
  if (difficulty === 'nightmare') return '#ff4d6d';
  if (difficulty === 'hard') return '#ff9f1c';
  return '#2ec4b6';
}

async function drawBackground(ctx, width, height, backgroundPath) {
  if (backgroundPath) {
    const image = await loadImage(backgroundPath);
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#111827');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawOverlay(ctx, width, height) {
  const shadow = ctx.createLinearGradient(0, 0, 0, height);
  shadow.addColorStop(0, 'rgba(2,6,23,0.20)');
  shadow.addColorStop(1, 'rgba(2,6,23,0.82)');
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, width, height);
}

function drawGlassPanel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(15,23,42,0.58)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(148,163,184,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawHpBar(ctx, x, y, w, h, current, max, accent) {
  const ratio = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(71,85,105,0.8)';
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

  const fillW = Math.floor((w - 4) * ratio);
  const hpGrad = ctx.createLinearGradient(x, y, x + w, y);
  hpGrad.addColorStop(0, accent);
  hpGrad.addColorStop(1, '#22d3ee');
  ctx.fillStyle = hpGrad;
  ctx.fillRect(x + 2, y + 2, fillW, h - 4);
}

function createBossRenderService() {
  return {
    async generateBossFightPng(payload) {
      const {
        bossName,
        bossKey,
        anime,
        difficulty,
        hpCurrent,
        hpMax,
        attackerTag,
        cardName,
        damage,
        defeated,
        fontFamily = 'sans-serif'
      } = payload;

      const width = 1280;
      const height = 720;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const accent = difficultyColor(difficulty);

      const backgroundPath = resolveBossBackground({ anime, difficulty, defeated });
      await drawBackground(ctx, width, height, backgroundPath);
      drawOverlay(ctx, width, height);

      drawGlassPanel(ctx, 50, 44, 1180, 164);
      drawGlassPanel(ctx, 50, 236, 740, 430);
      drawGlassPanel(ctx, 816, 236, 414, 430);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `700 56px ${fontFamily}, sans-serif`;
      ctx.fillText(bossName, 80, 116);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 26px ${fontFamily}, sans-serif`;
      ctx.fillText(`Boss Key: ${bossKey}`, 82, 154);
      ctx.fillText(`Anime: ${String(anime).toUpperCase()}`, 420, 154);

      ctx.fillStyle = accent;
      ctx.font = `700 28px ${fontFamily}, sans-serif`;
      ctx.fillText(`Difficulty: ${String(difficulty).toUpperCase()}`, 856, 154);

      drawHpBar(ctx, 82, 172, 1118, 24, hpCurrent, hpMax, accent);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `600 24px ${fontFamily}, sans-serif`;
      ctx.fillText(`HP ${hpCurrent} / ${hpMax}`, 84, 226);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.fillText('Battle Impact', 80, 292);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = `600 28px ${fontFamily}, sans-serif`;
      ctx.fillText(`Attacker: ${attackerTag}`, 82, 344);
      ctx.fillText(`Card Used: ${cardName}`, 82, 390);

      ctx.fillStyle = '#fb7185';
      ctx.font = `800 62px ${fontFamily}, sans-serif`;
      ctx.fillText(`-${damage}`, 82, 482);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 24px ${fontFamily}, sans-serif`;
      ctx.fillText(defeated ? 'FINISHER HIT' : 'DAMAGE DEALT', 86, 520);

      ctx.fillStyle = defeated ? '#22c55e' : '#38bdf8';
      ctx.font = `700 34px ${fontFamily}, sans-serif`;
      ctx.fillText(defeated ? 'Boss defeated. Rewards can now be claimed.' : 'Boss still standing. Keep attacking.', 82, 612);

      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      ctx.font = `500 22px ${fontFamily}, sans-serif`;
      ctx.fillText('SOULFALRES BOSS RAID UI', 826, 636);

      return canvas.toBuffer('image/png');
    }
  };
}

module.exports = { createBossRenderService };

