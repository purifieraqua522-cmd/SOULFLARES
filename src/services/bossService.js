const { animes } = require('../data/constants');

function calcDifficultyMod(difficulty) {
  if (difficulty === 'nightmare') return 2.1;
  if (difficulty === 'hard') return 1.45;
  return 1.0;
}

function createBossService(repos) {
  async function spawnBossFromRow(boss) {
    const hp = boss.hp_base;
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString();
    return repos.createActiveBoss({
      boss_key: boss.boss_key,
      difficulty: 'easy',
      hp_current: hp,
      hp_max: hp,
      expires_at: expiresAt,
      state: 'open',
      participants: []
    });
  }

  return {
    async spawnScheduledBoss({ anime, isSuper = false }) {
      const info = animes[anime];
      if (!info) throw new Error('Invalid anime');
      const options = isSuper ? [info.superBoss] : info.bosses;
      const bossKey = options[Math.floor(Math.random() * options.length)];
      const boss = await repos.getBossByKey(bossKey);
      if (!boss) throw new Error('Boss missing in DB');
      return spawnBossFromRow(boss);
    },

    async spawnSpecificBoss(bossKey) {
      const boss = await repos.getBossByKey(bossKey);
      if (!boss) throw new Error(`Unknown boss key: ${bossKey}`);
      return spawnBossFromRow(boss);
    },

    async listBossCatalog() {
      return repos.getAllBosses();
    },

    async voteAndStart(bossId, difficulty, userIds) {
      if (!['easy', 'hard', 'nightmare'].includes(difficulty)) throw new Error('Invalid difficulty');
      if (userIds.length < 3) throw new Error('At least 3 players required');

      const open = await repos.getOpenBosses();
      const boss = open.find((x) => x.id === bossId);
      if (!boss) throw new Error('Boss not open');

      const mod = calcDifficultyMod(difficulty);
      const hpMax = Math.floor(boss.hp_max * mod);
      return repos.updateBoss(boss.id, {
        difficulty,
        hp_current: hpMax,
        hp_max: hpMax,
        participants: userIds,
        state: 'active'
      });
    },

    async attackBoss(userId, bossId, power) {
      const open = await repos.getOpenBosses();
      const boss = open.find((x) => x.id === bossId);
      if (!boss) throw new Error('Boss not available');

      const damage = Math.max(1, Math.floor(power * (0.75 + Math.random() * 0.4)));
      const hp = Math.max(0, boss.hp_current - damage);
      let state = boss.state;
      if (hp === 0) state = 'defeated';

      const participants = Array.isArray(boss.participants) ? boss.participants : [];
      if (!participants.includes(userId)) participants.push(userId);

      const updated = await repos.updateBoss(boss.id, { hp_current: hp, participants, state });
      return { updated, damage, defeated: hp === 0 };
    }
  };
}

module.exports = { createBossService, calcDifficultyMod };
