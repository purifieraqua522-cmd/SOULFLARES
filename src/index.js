const dotenv = require('dotenv');
dotenv.config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  REST,
  Routes
} = require('discord.js');

const { loadEnv } = require('./core/env');
const { logInfo, logError, logWarn } = require('./core/logger');
const { createDb } = require('./core/db');
const { createRepositories } = require('./data/repositories');
const { commandModules, commandMap } = require('./commands');
const { startBossSchedulers } = require('./jobs/bossScheduler');
const { createSummonService } = require('./services/summonService');
const { createCardService } = require('./services/cardService');
const { createBossService } = require('./services/bossService');
const { createRaidService } = require('./services/raidService');
const { createStoreService } = require('./services/storeService');
const { createAssetsService } = require('./services/assetsService');
const { createBossRenderService } = require('./services/bossRenderService');
const { registerFonts } = require('./core/fonts');
const pngService = require('./services/pngService');
const { replyError } = require('./ui/responders');

async function deployCommands(env) {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const payload = commandModules.map((mod) => mod.data.toJSON());

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body: payload
    });
    logInfo('Guild commands deployed', { guild: env.DISCORD_GUILD_ID });
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: payload });
    logInfo('Global commands deployed');
  }
}

async function main() {
  const env = loadEnv();
  const db = createDb(env);
  const repos = createRepositories(db);
  const registeredFonts = registerFonts(env);
  const primaryFontFamily = env.PRIMARY_FONT_FAMILY || registeredFonts[0]?.family || 'sans-serif';

  const summonService = createSummonService(repos);
  const cardService = createCardService(repos);
  const bossService = createBossService(repos);
  const raidService = createRaidService(repos);
  const storeService = createStoreService(repos);
  const assetsService = createAssetsService(repos);
  const bossRenderService = createBossRenderService();
  await assetsService.syncCardsFromAssets();

  const ctx = {
    env,
    db,
    repos,
    summonService,
    cardService,
    bossService,
    raidService,
    storeService,
    pngService,
    assetsService,
    bossRenderService,
    primaryFontFamily
  };

  await deployCommands(env);

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
  });

  client.once(Events.ClientReady, (readyClient) => {
    logInfo(`SOULFALRES logged in as ${readyClient.user.tag}`);
    startBossSchedulers({ bossService });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
      const module = commandMap.get(interaction.commandName);
      if (!module?.autocomplete) return;
      try {
        await module.autocomplete(interaction, ctx);
      } catch (error) {
        logWarn('Autocomplete failed', { command: interaction.commandName, error: error.message });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const module = commandMap.get(interaction.commandName);
    if (!module) {
      return replyError(interaction, 'Unknown command');
    }

    try {
      await module.execute(interaction, ctx);
    } catch (error) {
      logError('Command execution failed', error);
      if (!interaction.replied && !interaction.deferred) {
        await replyError(interaction, 'Command failed unexpectedly.');
      } else {
        logWarn('Interaction already replied, skipped error reply.');
      }
    }
  });

  client.on(Events.Error, (error) => {
    logError('Discord client error', error);
  });

  await client.login(env.DISCORD_TOKEN);
}

main().catch((error) => {
  logError('Fatal startup error', error);
  process.exit(1);
});
