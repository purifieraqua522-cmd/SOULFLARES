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
    try {
      const image = await loadImage(backgroundPath);
      ctx.drawImage(image, 0, 0, width, height);
      return;
    } catch {
      // Fall through to gradient fallback.
    }
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
    async generateBossSpawnPng(payload) {
      const {
        bossName,
        bossKey,
        anime,
        difficulty,
        hpMax,
        isSuper,
        isEvent,
        participants = [],
        fontFamily = 'sans-serif'
      } = payload;

      const width = 1600;
      const height = 900;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e293b');
      bgGrad.addColorStop(1, '#111827');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Difficulty color
      const diffColor = difficulty === 'nightmare' ? '#ff4d6d' : difficulty === 'hard' ? '#ff9f1c' : '#2ec4b6';
      const typeColor = isEvent ? '#f59e0b' : isSuper ? '#ec4899' : '#06b6d4';

      // Top panel - Boss Info
      const panelGrad = ctx.createLinearGradient(0, 0, width, 220);
      panelGrad.addColorStop(0, 'rgba(15,23,42,0.95)');
      panelGrad.addColorStop(1, 'rgba(30,41,59,0.8)');
      ctx.fillStyle = panelGrad;
      ctx.fillRect(0, 0, width, 220);

      // Top border accent
      ctx.fillStyle = typeColor;
      ctx.fillRect(0, 0, width, 4);

      // Boss name
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 96px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(bossName, 80, 120);

      // Boss key and details
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 32px ${fontFamily}, sans-serif`;
      ctx.fillText(`Boss Key: ${bossKey}`, 80, 165);

      // Anime label (right side)
      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 28px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`Anime: ${String(anime).toUpperCase()}`, width - 80, 100);

      // Type badge
      ctx.fillStyle = typeColor;
      ctx.font = `700 26px ${fontFamily}, sans-serif`;
      const typeText = isEvent ? 'EVENT' : isSuper ? 'SUPER' : 'NORMAL';
      ctx.fillText(typeText, width - 80, 155);

      // Difficulty badge (right side bottom)
      ctx.fillStyle = diffColor;
      ctx.font = `700 32px ${fontFamily}, sans-serif`;
      ctx.fillText(difficulty.toUpperCase(), width - 80, 195);

      // Middle panel - HP and Stats
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(80, 260, 1440, 380);
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 260, 1440, 380);

      // HP Bar background
      ctx.fillStyle = 'rgba(15,23,42,0.9)';
      ctx.fillRect(120, 310, 1360, 60);
      ctx.strokeStyle = diffColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(120, 310, 1360, 60);

      // HP Bar fill
      const hpGrad = ctx.createLinearGradient(120, 310, 1480, 310);
      hpGrad.addColorStop(0, diffColor);
      hpGrad.addColorStop(1, '#22d3ee');
      ctx.fillStyle = hpGrad;
      ctx.fillRect(122, 312, 1356, 56);

      // HP text
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 40px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${hpMax.toLocaleString()} HP`, 800, 354);

      // Stats grid
      const statY = 420;
      const stat1X = 200;
      const stat2X = 800;
      const stat3X = 1400;

      // Stat boxes
      [stat1X, stat2X, stat3X].forEach((x) => {
        ctx.fillStyle = 'rgba(30,41,59,0.8)';
        ctx.fillRect(x - 140, statY - 40, 280, 100);
        ctx.strokeStyle = 'rgba(148,163,184,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 140, statY - 40, 280, 100);
      });

      // Stat 1: Difficulty
      ctx.fillStyle = diffColor;
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('DIFFICULTY', stat1X, statY - 10);
      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 28px ${fontFamily}, sans-serif`;
      ctx.fillText(difficulty.toUpperCase(), stat1X, statY + 35);

      // Stat 2: Status
      ctx.fillStyle = '#22c55e';
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.fillText('STATUS', stat2X, statY - 10);
      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 28px ${fontFamily}, sans-serif`;
      ctx.fillText('OPEN', stat2X, statY + 35);

      // Stat 3: Participants
      ctx.fillStyle = '#3b82f6';
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.fillText('PARTICIPANTS', stat3X, statY - 10);
      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 28px ${fontFamily}, sans-serif`;
      ctx.fillText(`${participants.length}`, stat3X, statY + 35);

      // Bottom section - Action info
      ctx.fillStyle = 'rgba(15,23,42,0.8)';
      ctx.fillRect(80, 680, 1440, 180);
      ctx.strokeStyle = 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(80, 680, 1440, 180);

      // Instructions
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `600 32px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('⚔️  BOSS SPAWNED!', 120, 730);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 26px ${fontFamily}, sans-serif`;
      ctx.fillText('Use /boss attack to attack this boss', 120, 770);
      ctx.fillText('Use /boss vote to start a raid with minimum 3 players', 120, 805);

      // Footer
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = `500 20px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('SOULFLARES - BOSS SYSTEM v2.0', width - 80, 840);

      return canvas.toBuffer('image/png');
    },

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
