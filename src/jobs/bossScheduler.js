const cron = require('node-cron');
const { logInfo, logError } = require('../core/logger');

function startBossSchedulers({ bossService }) {
  cron.schedule('0 * * * *', async () => {
    try {
      const animes = ['onepiece', 'naruto', 'bleach', 'jjk'];
      for (const anime of animes) {
        await bossService.spawnScheduledBoss({ anime, isSuper: false });
      }
      logInfo('Normal bosses spawned');
    } catch (error) {
      logError('Normal boss scheduler failed', error);
    }
  });

  cron.schedule('0 */2 * * *', async () => {
    try {
      const animes = ['onepiece', 'naruto', 'bleach', 'jjk'];
      for (const anime of animes) {
        await bossService.spawnScheduledBoss({ anime, isSuper: true });
      }
      logInfo('Super bosses spawned');
    } catch (error) {
      logError('Super boss scheduler failed', error);
    }
  });
}

module.exports = { startBossSchedulers };
