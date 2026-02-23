const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

function findFirstExisting(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveBossBackground({ anime, bossKey, difficulty, defeated }) {
  const root = path.resolve(process.cwd(), 'assets/backgrounds/boss');
  const suffix = defeated ? '_defeated' : '';
  return findFirstExisting([
    path.join(root, `${bossKey}_${difficulty}${suffix}.png`),
    path.join(root, `${bossKey}${suffix}.png`),
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

function resolveBossCharacter({ bossKey, anime }) {
  const rootCandidates = [
    path.resolve(process.cwd(), `assets/backgrounds/boss/characters/${bossKey}.png`),
    path.resolve(process.cwd(), `assets/cards/${anime}/${bossKey}.png`),
    path.resolve(process.cwd(), `assets/cards/${bossKey}.png`),
    path.resolve(process.cwd(), `assets/backgrounds/boss/characters/${anime}_${bossKey}.png`)
  ];
  return findFirstExisting(rootCandidates);
}

function difficultyColor(difficulty) {
  if (difficulty === 'nightmare') return '#ff4d6d';
  if (difficulty === 'hard') return '#ff9f1c';
  return '#2ec4b6';
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, r || 8);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
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

      // Background (try per-boss background, fallback to gradient)
      const backgroundPath = resolveBossBackground({ anime, bossKey, difficulty, defeated: false });
      await drawBackground(ctx, width, height, backgroundPath);
      drawOverlay(ctx, width, height);

      // Difficulty color
          // Refined color palette
          const diffColor = difficulty === 'nightmare' ? '#ff6b8a' : difficulty === 'hard' ? '#ffb86b' : '#34d399';
          const typeColor = isEvent ? '#f97316' : isSuper ? '#e879f9' : '#38bdf8';


      // Top panel - Boss Info (slim glass bar)
      drawGlassPanel(ctx, 40, 40, width - 80, 180);
      // Top border accent
      ctx.fillStyle = typeColor;
      ctx.fillRect(40, 40, width - 80, 6);

      // Boss name
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 72px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(bossName, 120, 120);

      // Boss key and details
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 32px ${fontFamily}, sans-serif`;
      ctx.fillText(`Boss Key: ${bossKey}`, 80, 165);

      // Anime label (right side)
      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 22px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`${String(anime).toUpperCase()}`, width - 120, 90);

      // Type & Difficulty badges (stacked right) with rounded background
      const badgeX = width - 180;
      ctx.textAlign = 'center';

      // Type badge
      const typeText = isEvent ? 'EVENT' : isSuper ? 'SUPER' : 'NORMAL';
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      drawRoundedRect(ctx, badgeX - 70, 110, 140, 36, 10);
      ctx.fillStyle = typeColor;
      ctx.font = `700 20px ${fontFamily}, sans-serif`;
      ctx.fillText(typeText, badgeX, 135);

      // Difficulty badge
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      drawRoundedRect(ctx, badgeX - 60, 150, 120, 32, 8);
      ctx.fillStyle = diffColor;
      ctx.font = `700 18px ${fontFamily}, sans-serif`;
      ctx.fillText(difficulty.toUpperCase(), badgeX, 172);

      // Middle panel - HP and Stats (slightly translucent)
      drawGlassPanel(ctx, 80, 240, 1440, 400);


      // HP Bar background and fill
      drawHpBar(ctx, 140, 330, 1320, 56, hpMax, hpMax, diffColor);

      // HP text
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${hpMax.toLocaleString()} HP`, width / 2, 364);

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


      // NOTE: Removed bottom action panel per request — cleaner HUD above

      // Draw boss character in foreground (right side) if available
      try {
        const charPath = resolveBossCharacter({ bossKey, anime });
        if (charPath) {
          const img = await loadImage(charPath);
          // drop shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 40;
          const charW = Math.floor(width * 0.42);
          const charH = Math.floor(height * 0.9);
          const charX = width - charW - 60;
          const charY = height - charH - 40;
          // maintain aspect ratio
          const ratio = Math.min(charW / img.width, charH / img.height);
          const dw = Math.floor(img.width * ratio);
          const dh = Math.floor(img.height * ratio);
          ctx.drawImage(img, charX + (charW - dw), charY + (charH - dh), dw, dh);
          ctx.restore();
        }
      } catch (err) {
        // ignore image errors
      }

      // Footer
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = `500 18px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('SOULFLARES - BOSS SYSTEM v2.0', width - 80, 860);

      return canvas.toBuffer('image/png');
    },

    async generateBossSpawnFrames(payload, frames = 6) {
      const buffers = [];
      for (let i = 0; i < frames; i++) {
        // pulse factor between 0.85 .. 1.15
        const pulse = 1 + Math.sin((i / frames) * Math.PI * 2) * 0.08;
        const adjusted = { ...payload, pulse };
        const buf = await this._renderSpawnFrame(adjusted);
        buffers.push(buf);
      }
      return buffers;
    },

    // internal: render a single frame which respects payload.pulse for subtle overlay changes
    async _renderSpawnFrame(payload) {
      const { pulse = 1 } = payload;
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

      // Background (try per-boss background, fallback to gradient)
      const backgroundPath = resolveBossBackground({ anime, bossKey, difficulty, defeated: false });
      await drawBackground(ctx, width, height, backgroundPath);

      // subtle overlay that pulses
      ctx.fillStyle = `rgba(255,255,255,${(pulse - 1) * 0.06})`;
      ctx.fillRect(0, 0, width, height);
      drawOverlay(ctx, width, height);

      // reuse main renderer pieces (simplified): top panel and HP text
      const diffColor = difficulty === 'nightmare' ? '#ff6b8a' : difficulty === 'hard' ? '#ffb86b' : '#34d399';
      const typeColor = isEvent ? '#f97316' : isSuper ? '#e879f9' : '#38bdf8';

      drawGlassPanel(ctx, 40, 40, width - 80, 180);
      ctx.fillStyle = typeColor;
      ctx.fillRect(40, 40, width - 80, 6);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 72px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(bossName, 120, 120);

      drawGlassPanel(ctx, 80, 240, 1440, 400);
      drawHpBar(ctx, 140, 330, 1320, 56, hpMax, hpMax, diffColor);
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 36px ${fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${hpMax.toLocaleString()} HP`, width / 2, 364);

      // character if available
      try {
        const charPath = resolveBossCharacter({ bossKey, anime });
        if (charPath) {
          const img = await loadImage(charPath);
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 40;
          const charW = Math.floor(width * 0.42);
          const charH = Math.floor(height * 0.9);
          const charX = width - charW - 60;
          const charY = height - charH - 40;
          const ratio = Math.min(charW / img.width, charH / img.height);
          const dw = Math.floor(img.width * ratio);
          const dh = Math.floor(img.height * ratio);
          ctx.drawImage(img, charX + (charW - dw), charY + (charH - dh), dw, dh);
          ctx.restore();
        }
      } catch (e) {}

      return canvas.toBuffer('image/png');
    },

    async generateBossPartyFightPng(payload) {
      const {
        bossName,
        bossKey,
        anime,
        difficulty,
        hpCurrent,
        hpMax,
        attackerTag,
        totalDamage,
        defeated,
        cardEntries = [],
        fontFamily = 'sans-serif'
      } = payload;

      const width = 1400;
      const height = 860;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const accent = difficultyColor(difficulty || 'easy');

      const backgroundPath = resolveBossBackground({ anime, bossKey, difficulty: difficulty || 'easy', defeated });
      await drawBackground(ctx, width, height, backgroundPath);
      drawOverlay(ctx, width, height);

      drawGlassPanel(ctx, 40, 30, 1320, 170);
      ctx.fillStyle = '#f8fafc';
      ctx.font = `700 54px ${fontFamily}, sans-serif`;
      ctx.fillText(bossName, 70, 98);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 24px ${fontFamily}, sans-serif`;
      ctx.fillText(`Boss: ${bossKey} | ${String(anime).toUpperCase()}`, 70, 138);
      drawHpBar(ctx, 70, 154, 1260, 24, hpCurrent, hpMax, accent);

      drawGlassPanel(ctx, 40, 230, 1320, 530);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `700 34px ${fontFamily}, sans-serif`;
      ctx.fillText('Auto Team Attack (5 Cards)', 70, 286);

      const slots = cardEntries.slice(0, 5);
      const cardW = 230;
      const cardH = 320;
      const gap = 20;
      const totalW = slots.length * cardW + Math.max(0, slots.length - 1) * gap;
      const startX = Math.floor((width - totalW) / 2);
      const topY = 320;

      for (let i = 0; i < slots.length; i++) {
        const c = slots[i];
        const x = startX + i * (cardW + gap);
        ctx.fillStyle = 'rgba(15,23,42,0.82)';
        ctx.fillRect(x, topY, cardW, cardH);
        ctx.strokeStyle = 'rgba(148,163,184,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, topY, cardW, cardH);

        try {
          if (c.imagePath) {
            const img = await loadImage(c.imagePath);
            ctx.drawImage(img, x + 8, topY + 8, cardW - 16, 220);
          }
        } catch {
          // Ignore missing art.
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 18px ${fontFamily}, sans-serif`;
        ctx.fillText(String(c.name || c.key || 'Card').slice(0, 20), x + 10, topY + 246);
        ctx.fillStyle = '#93c5fd';
        ctx.font = `600 16px ${fontFamily}, sans-serif`;
        ctx.fillText(`Power ${c.power || 0}`, x + 10, topY + 276);
      }

      ctx.fillStyle = '#fb7185';
      ctx.font = `800 56px ${fontFamily}, sans-serif`;
      ctx.fillText(`-${totalDamage}`, 70, 804);
      ctx.fillStyle = defeated ? '#22c55e' : '#38bdf8';
      ctx.font = `700 30px ${fontFamily}, sans-serif`;
      ctx.fillText(defeated ? `Finisher by ${attackerTag}` : `Attacker: ${attackerTag}`, 260, 804);

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

      const backgroundPath = resolveBossBackground({ anime, bossKey, difficulty, defeated });
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
