const cron = require('node-cron');
const { logInfo, logError, logWarn } = require('../core/logger');
const { buildBossSpawnPayload } = require('../ui/bossAnnouncement');

const DEFAULT_SPAWN_CHANNEL_ID = '1440435523947597875';
const ANIME_LIST = ['onepiece', 'naruto', 'bleach', 'jjk'];

async function spawnWave({ bossService, client, env, forceSuper = false }) {
  const spawnChannelId = env.BOSS_SPAWN_CHANNEL_ID || DEFAULT_SPAWN_CHANNEL_ID;
  if (!spawnChannelId) {
    logWarn('BOSS_SPAWN_CHANNEL_ID not configured. Skipping spawn wave.');
    return;
  }

  const channel = await client.channels.fetch(spawnChannelId).catch(() => null);
  if (!channel) {
    logError('Boss spawn channel not found', { channelId: spawnChannelId });
    return;
  }

  for (const anime of ANIME_LIST) {
    try {
      const { activeBoss, spawnPng } = await bossService.spawnScheduledBoss({ anime, isSuper: forceSuper });
      if (!activeBoss) continue;

      const payload = buildBossSpawnPayload(activeBoss, spawnPng);
      const sent = await channel.send(payload);
      logInfo('Boss spawned and posted to channel', {
        anime,
        bossKey: activeBoss.boss_key,
        rarity: activeBoss.is_secret ? 'secret' : activeBoss.is_super ? 'super' : 'normal',
        messageId: sent.id
      });
    } catch (err) {
      logError(`Failed to spawn boss for ${anime}`, err);
    }
  }
}

function startBossSchedulers({ bossService, client, env }) {
  // Normal/rarity wave: every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await spawnWave({ bossService, client, env, forceSuper: false });
    } catch (error) {
      logError('Hourly boss spawn scheduler failed', error);
    }
  });

  // Super wave: every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    try {
      await spawnWave({ bossService, client, env, forceSuper: true });
    } catch (error) {
      logError('Bi-hourly super boss scheduler failed', error);
    }
  });

  // One startup wave so channel is never empty after restart
  setTimeout(() => {
    spawnWave({ bossService, client, env, forceSuper: false }).catch((error) => {
      logError('Startup boss spawn wave failed', error);
    });
  }, 5000);
}

module.exports = { startBossSchedulers };