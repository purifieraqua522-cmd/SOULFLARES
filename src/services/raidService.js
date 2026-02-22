const crypto = require('crypto');

function createRaidService(repos) {
  return {
    async startRaid(userId, anime, difficulty) {
      const raid = await repos.createRaid({
        anime,
        host_user_id: userId,
        difficulty,
        required_power: difficulty === 'nightmare' ? 12000 : difficulty === 'hard' ? 7500 : 4200,
        state: 'lobby',
        members: [userId],
        rewards_seed: crypto.randomUUID()
      });
      return raid;
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
