const cron = require('node-cron');
const { logInfo, logError } = require('../core/logger');
const { raidPresets } = require('../data/constants');
const { generateRaidLobbyPng } = require('../services/raidRenderService');
const { buildRaidPayload } = require('../ui/raidAnnouncement');

const DEFAULT_CHANNEL = '1440435523947597875';
const PRESET_KEYS = Object.keys(raidPresets);

async function spawnRaidPanel({ raidService, client, env, presetKey }) {
  const channelId = env.BOSS_SPAWN_CHANNEL_ID || DEFAULT_CHANNEL;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) throw new Error(`Raid channel not found: ${channelId}`);

  const { raid, preset, state, raidKey } = await raidService.createSystemRaid(presetKey);
  const png = await generateRaidLobbyPng({
    raidKey,
    preset,
    state
  }).catch(() => null);

  const payload = buildRaidPayload({
    raid,
    raidPng: png,
    title: `🛡 RAID SPAWNED: ${preset.label}`,
    statusText: `Use buttons below to create team, join, and attack.`
  });

  const sent = await channel.send(payload);
  logInfo('Raid spawned and posted', { raidId: raid.id, raidKey, messageId: sent.id });
}

function startRaidSchedulers({ raidService, client, env }) {
  // Spawn every 3 hours at :10
  cron.schedule('10 */3 * * *', async () => {
    try {
      const utcHour = new Date().getUTCHours();
      const key = PRESET_KEYS[utcHour % PRESET_KEYS.length];
      await spawnRaidPanel({ raidService, client, env, presetKey: key });
    } catch (error) {
      logError('Raid scheduler failed', error);
    }
  });

  // Startup raid panel
  setTimeout(async () => {
    try {
      const key = PRESET_KEYS[0];
      await spawnRaidPanel({ raidService, client, env, presetKey: key });
    } catch (error) {
      logError('Startup raid spawn failed', error);
    }
  }, 9000);
}

module.exports = { startRaidSchedulers, spawnRaidPanel };
