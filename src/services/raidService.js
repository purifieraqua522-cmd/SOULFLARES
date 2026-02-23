const crypto = require('crypto');
const { raidPresets } = require('../data/constants');

function createRaidService(repos) {
  return {
    async startRaid(userId, anime, raidKey) {
      try {
        await repos.consumeMaterial(userId, 'raid_ticket', 1);
      } catch {
        throw new Error('You need 1 raid_ticket to start a raid. Buy one in /store buy.');
      }

      const preset = raidPresets[raidKey];
      if (!preset) throw new Error('Invalid raid preset.');
      if (preset.anime !== anime) throw new Error('Raid does not match selected anime.');

      const raid = await repos.createRaid({
        anime,
        host_user_id: userId,
        difficulty: `fixed:${raidKey}`,
        required_power: preset.fixedPower,
        state: 'lobby',
        members: [userId],
        rewards_seed: `${raidKey}:${crypto.randomUUID()}`
      });
      return { raid, preset };
    },

    async joinRaid(userId, raidId) {
      const raid = await repos.getRaid(raidId);
      if (!raid) throw new Error('Raid not found');
      if (raid.state !== 'lobby') throw new Error('Raid already started');

      const members = Array.isArray(raid.members) ? raid.members : [];
      if (!members.includes(userId)) members.push(userId);

      const state = members.length >= 3 ? 'active' : 'lobby';
      return repos.updateRaid(raid.id, { members, state });
    }
  };
}

module.exports = { createRaidService };