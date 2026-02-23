const crypto = require('crypto');
const { raidPresets, animes } = require('../data/constants');

function parseRaidKey(raw) {
  const value = String(raw || '');
  if (value.startsWith('preset:')) return value.slice(7);
  if (raidPresets[value]) return value;
  return null;
}

function buildDefaultState(preset) {
  return {
    users: [],
    hp_current: preset.fixedPower,
    hp_max: preset.fixedPower,
    stage_index: 0,
    boss_key: preset.stages[0],
    damage_log: {}
  };
}

function readState(raid, preset) {
  const base = buildDefaultState(preset);
  const m = raid?.members;

  if (Array.isArray(m)) {
    base.users = [...new Set(m.map((x) => String(x)))];
    return base;
  }

  if (m && typeof m === 'object') {
    return {
      users: Array.isArray(m.users) ? [...new Set(m.users.map((x) => String(x)))] : base.users,
      hp_current: Number(m.hp_current ?? base.hp_current),
      hp_max: Number(m.hp_max ?? base.hp_max),
      stage_index: Number(m.stage_index ?? base.stage_index),
      boss_key: String(m.boss_key || base.boss_key),
      damage_log: m.damage_log && typeof m.damage_log === 'object' ? m.damage_log : {}
    };
  }

  return base;
}

function currencyForAnime(anime) {
  return animes[anime]?.currency || 'berries';
}

function createRaidService(repos) {
  async function getRaidSnapshot(raidId) {
    const raid = await repos.getRaid(raidId);
    if (!raid) throw new Error('Raid not found');

    const raidKey = parseRaidKey(raid.difficulty);
    if (!raidKey || !raidPresets[raidKey]) throw new Error('Raid preset missing');

    const preset = raidPresets[raidKey];
    const state = readState(raid, preset);
    return { raid, preset, state, raidKey };
  }

  return {
    async createSystemRaid(raidKey) {
      const preset = raidPresets[raidKey];
      if (!preset) throw new Error('Invalid raid preset');
      await repos.ensureProfile('SYSTEM');

      const payload = {
        anime: preset.anime,
        host_user_id: 'SYSTEM',
        difficulty: `preset:${raidKey}`,
        required_power: preset.fixedPower,
        state: 'lobby',
        members: buildDefaultState(preset),
        rewards_seed: crypto.randomUUID()
      };

      const raid = await repos.createRaid(payload);
      return { raid, preset, state: readState(raid, preset), raidKey };
    },

    async getRaidSnapshot(raidId) {
      return getRaidSnapshot(raidId);
    },

    async createTeam(userId, raidId) {
      await repos.ensureProfile(userId);
      const { raid, preset, state, raidKey } = await getRaidSnapshot(raidId);
      if (raid.state === 'cleared') throw new Error('Raid already cleared');

      if (!state.users.includes(userId)) state.users.push(userId);
      const patch = {
        host_user_id: userId,
        state: 'active',
        members: state
      };

      const updated = await repos.updateRaid(raid.id, patch);
      return { raid: updated, preset, state: readState(updated, preset), raidKey };
    },

    async joinTeam(userId, raidId) {
      await repos.ensureProfile(userId);
      const { raid, preset, state, raidKey } = await getRaidSnapshot(raidId);
      if (raid.state === 'cleared') throw new Error('Raid already cleared');
      if (state.users.length >= 6 && !state.users.includes(userId)) throw new Error('Team is full (max 6).');

      if (!state.users.includes(userId)) state.users.push(userId);
      const nextState = raid.state === 'lobby' ? 'active' : raid.state;
      const updated = await repos.updateRaid(raid.id, { state: nextState, members: state });
      return { raid: updated, preset, state: readState(updated, preset), raidKey };
    },

    async attackRaid(userId, raidId, computePartyPower) {
      await repos.ensureProfile(userId);
      const { raid, preset, state, raidKey } = await getRaidSnapshot(raidId);
      if (raid.state === 'cleared') throw new Error('Raid already cleared');
      if (!state.users.includes(userId)) throw new Error('Join the raid team first.');

      const partyPower = await computePartyPower(userId);
      if (!partyPower || partyPower <= 0) throw new Error('No usable cards in inventory.');

      const damage = Math.max(1, Math.floor(partyPower * (0.55 + Math.random() * 0.35)));
      state.damage_log[userId] = Number(state.damage_log[userId] || 0) + damage;

      let stageCleared = false;
      let raidCleared = false;
      state.hp_current -= damage;

      if (state.hp_current <= 0) {
        stageCleared = true;
        const nextIndex = state.stage_index + 1;

        if (nextIndex >= preset.stages.length) {
          raidCleared = true;
          state.hp_current = 0;
        } else {
          state.stage_index = nextIndex;
          state.boss_key = preset.stages[nextIndex];
          state.hp_max = Math.floor(preset.fixedPower * (1 + nextIndex * 0.22));
          state.hp_current = state.hp_max;
        }
      }

      const nextRaidState = raidCleared ? 'cleared' : 'active';
      const updated = await repos.updateRaid(raid.id, { state: nextRaidState, members: state });
      const resolvedState = readState(updated, preset);

      let rewards = [];
      if (raidCleared) {
        const currency = currencyForAnime(preset.anime);
        rewards = await Promise.all(
          resolvedState.users.map(async (uid) => {
            const payout = Math.floor(900 * (0.9 + Math.random() * 0.35));
            await repos.addCurrency(uid, currency, payout);
            return { userId: uid, currency, payout };
          })
        );
      }

      return {
        raid: updated,
        preset,
        state: resolvedState,
        raidKey,
        damage,
        stageCleared,
        raidCleared,
        rewards,
        currentBossKey: resolvedState.boss_key,
        currentStage: resolvedState.stage_index + 1,
        totalStages: preset.stages.length
      };
    }
  };
}

module.exports = { createRaidService, readState };
