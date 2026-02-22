const cron = require('node-cron');
const { logInfo, logError, logWarn } = require('../core/logger');
const { buildBossSpawnPayload } = require('../ui/bossAnnouncement');

function startBossSchedulers({ bossService, client, env }) {
  // Spawn bosses at 00:00 (midnight) daily
  cron.schedule('0 0 * * *', async () => {
    try {
      logInfo('Starting daily boss spawn at 00:00');
      const spawnChannelId = env.BOSS_SPAWN_CHANNEL_ID;

      if (!spawnChannelId) {
        logWarn('BOSS_SPAWN_CHANNEL_ID not configured. Skipping daily boss spawn.');
        return;
      }

      const channel = await client.channels.fetch(spawnChannelId).catch(() => null);
      if (!channel) {
        logError('Boss spawn channel not found', { channelId: spawnChannelId });
        return;
      }

      const animeList = ['onepiece', 'naruto', 'bleach', 'jjk'];
      for (const anime of animeList) {
        try {
          const { activeBoss, spawnPng } = await bossService.spawnScheduledBoss({ anime, isSuper: false });
          if (!activeBoss) continue;

          const payload = buildBossSpawnPayload(activeBoss, spawnPng);
          await channel.send(payload);
          logInfo('Boss spawned and posted to channel', { anime, bossKey: activeBoss.boss_key });
        } catch (err) {
          logError(`Failed to spawn boss for ${anime}`, err);
        }
      }
    } catch (error) {
      logError('Daily boss spawn scheduler failed', error);
    }
  });
}

module.exports = { startBossSchedulers };