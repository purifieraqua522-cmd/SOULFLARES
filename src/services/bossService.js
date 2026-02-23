const { animes } = require('../data/constants');

function calcDifficultyMod(difficulty) {
  if (difficulty === 'nightmare') return 2.1;
  if (difficulty === 'hard') return 1.45;
  return 1.0;
}

function randomPick(list) {
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function rollDropChance(bossMeta) {
  if (bossMeta?.is_secret) return 0.65;
  if (bossMeta?.is_super) return 0.35;
  return 0.18;
}

function rarityWeightsForBoss(bossMeta) {
  if (bossMeta?.is_secret) return { secret: 0.12, mythical: 0.33, legendary: 0.35, epic: 0.2 };
  if (bossMeta?.is_super) return { secret: 0.03, mythical: 0.18, legendary: 0.34, epic: 0.45 };
  return { secret: 0.005, mythical: 0.06, legendary: 0.23, epic: 0.705 };
}

function weightedRarity(weights) {
  const roll = Math.random();
  let acc = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    acc += weight;
    if (roll <= acc) return rarity;
  }
  return 'epic';
}

function createBossService(repos, bossRenderService) {
  async function spawnBossFromRow(boss) {
    const hp = boss.hp_base;
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString();
    const activeBoss = await repos.createActiveBoss({
      boss_key: boss.boss_key,
      difficulty: 'easy',
      hp_current: hp,
      hp_max: hp,
      expires_at: expiresAt,
      state: 'open',
      participants: []
    });

    let spawnPng = null;
    if (bossRenderService) {
      try {
        spawnPng = await bossRenderService.generateBossSpawnPng({
          bossName: boss.display_name,
          bossKey: boss.boss_key,
          anime: boss.anime,
          difficulty: 'easy',
          hpMax: hp,
          isSuper: boss.is_super || false,
          isEvent: boss.is_event || false,
          participants: []
        });
      } catch (err) {
        console.warn('Failed to generate spawn PNG:', err.message);
      }
    }

    const enrichedBoss = {
      ...activeBoss,
      anime: boss.anime,
      display_name: boss.display_name,
      is_super: boss.is_super || false,
      is_event: boss.is_event || false,
      is_secret: boss.is_secret || false
    };

    return { activeBoss: enrichedBoss, spawnPng };
  }

  return {
    async spawnScheduledBoss({ anime, isSuper = false }) {
      const info = animes[anime];
      if (!info) throw new Error('Invalid anime');

      const catalog = (await repos.getAllBosses()).filter((b) => b.anime === anime);
      if (!catalog.length) throw new Error('No bosses found for anime');

      const normals = catalog.filter((b) => !b.is_super && !b.is_secret);
      const supers = catalog.filter((b) => b.is_super && !b.is_secret);
      const secrets = catalog.filter((b) => b.is_secret);

      let boss = null;
      if (isSuper) {
        boss = randomPick([...supers, ...secrets]) || randomPick(catalog);
      } else {
        const roll = Math.random();
        if (secrets.length && roll < 0.03) {
          boss = randomPick(secrets);
        } else if (supers.length && roll < 0.27) {
          boss = randomPick(supers);
        } else {
          boss = randomPick(normals) || randomPick(catalog);
        }
      }

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
      const attackable = await repos.getAttackableBosses();
      const boss = attackable.find((x) => x.id === bossId);
      if (!boss) throw new Error('Boss not available');

      const damage = Math.max(1, Math.floor(power * (0.75 + Math.random() * 0.4)));
      const hp = Math.max(0, boss.hp_current - damage);
      let state = boss.state;
      if (hp === 0) state = 'defeated';

      const participants = Array.isArray(boss.participants) ? boss.participants.slice() : [];
      if (!participants.includes(userId)) participants.push(userId);

      const updated = await repos.updateBoss(boss.id, { hp_current: hp, participants, state });

      const drops = [];
      if (hp === 0 && boss.state !== 'defeated') {
        const bossMeta = await repos.getBossByKey(boss.boss_key);
        const animeCfg = await repos.getAnimeConfig(bossMeta?.anime || '');
        const currency = animeCfg?.currency || animes[bossMeta?.anime || 'onepiece']?.currency || 'berries';
        const cardPool = await repos.getCardsByAnime(bossMeta?.anime || '');
        const eligibleCards = cardPool.filter((c) => ['epic', 'legendary', 'mythical', 'secret'].includes(c.rarity));
        const weights = rarityWeightsForBoss(bossMeta);

        for (const pid of participants) {
          const baseCurrency = bossMeta?.is_secret ? 1300 : bossMeta?.is_super ? 800 : 420;
          const payout = Math.floor(baseCurrency * (0.9 + Math.random() * 0.3));
          await repos.addCurrency(pid, currency, payout);

          let cardDrop = null;
          if (Math.random() < rollDropChance(bossMeta) && eligibleCards.length) {
            const rarity = weightedRarity(weights);
            const rarityPool = eligibleCards.filter((c) => c.rarity === rarity);
            cardDrop = randomPick(rarityPool.length ? rarityPool : eligibleCards);
            if (cardDrop) await repos.upsertUserCard(pid, cardDrop.key, { copies: 1 });
          }

          drops.push({
            userId: pid,
            currency,
            payout,
            cardKey: cardDrop?.key || null,
            cardName: cardDrop?.display_name || null
          });
        }
      }

      return { updated, damage, defeated: hp === 0, drops };
    },

    async joinActiveBoss(userId, bossId) {
      const boss = await repos.getActiveBossById(bossId);
      if (!boss) throw new Error('Boss not found');
      if (boss.state !== 'open' && boss.state !== 'active') throw new Error('Boss not joinable');

      const participants = Array.isArray(boss.participants) ? boss.participants.slice() : [];
      if (!participants.includes(userId)) participants.push(userId);

      const updated = await repos.updateBoss(boss.id, { participants });
      const bossMeta = await repos.getBossByKey(boss.boss_key);
      const enrichedBoss = {
        ...updated,
        anime: bossMeta?.anime || boss.anime,
        display_name: bossMeta?.display_name || boss.display_name || boss.boss_key,
        is_super: Boolean(bossMeta?.is_super),
        is_event: Boolean(bossMeta?.is_event),
        is_secret: Boolean(bossMeta?.is_secret)
      };

      let spawnPng = null;
      if (bossRenderService) {
        try {
          spawnPng = await bossRenderService.generateBossSpawnPng({
            bossName: enrichedBoss.display_name,
            bossKey: boss.boss_key,
            anime: enrichedBoss.anime,
            difficulty: enrichedBoss.difficulty || 'easy',
            hpMax: enrichedBoss.hp_max || enrichedBoss.hp_current,
            isSuper: enrichedBoss.is_super || false,
            isEvent: enrichedBoss.is_event || false,
            participants
          });
        } catch (err) {
          console.warn('Failed to regenerate spawn PNG on join:', err.message);
        }
      }

      return { updated: enrichedBoss, spawnPng };
    }
  };
}

module.exports = { createBossService, calcDifficultyMod };