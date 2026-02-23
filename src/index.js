const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits, Partials, Events, REST, Routes, AttachmentBuilder } = require('discord.js');

const { loadEnv } = require('./core/env');
const { logInfo, logError, logWarn } = require('./core/logger');
const { createDb } = require('./core/db');
const { createRepositories } = require('./data/repositories');
const { commandModules, commandMap } = require('./commands');
const { startBossSchedulers } = require('./jobs/bossScheduler');
const { startRaidSchedulers } = require('./jobs/raidScheduler');
const { createSummonService } = require('./services/summonService');
const { createCardService } = require('./services/cardService');
const { createBossService } = require('./services/bossService');
const { createRaidService } = require('./services/raidService');
const { createStoreService } = require('./services/storeService');
const { createAssetsService } = require('./services/assetsService');
const { createBossRenderService } = require('./services/bossRenderService');
const { registerFonts } = require('./core/fonts');
const { calcCardPower } = require('./services/progressionService');
const pngService = require('./services/pngService');
const { replyError } = require('./ui/responders');
const { buildOwnerSet } = require('./core/owners');
const { buildBossSpawnPayload } = require('./ui/bossAnnouncement');
const { buildRaidPayload } = require('./ui/raidAnnouncement');
const { generateRaidLobbyPng } = require('./services/raidRenderService');

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

async function findOwnedCardByQuery(repos, userId, query) {
  const needle = normalizeText(query);
  if (!needle) return null;

  const owned = await repos.getUserCards(userId);
  if (!owned.length) return null;

  const candidates = await Promise.all(
    owned.map(async (userCard) => {
      const card = await repos.getCardByKey(userCard.card_key);
      if (!card) return null;
      return {
        userCard,
        card,
        keyNorm: normalizeText(card.key),
        nameNorm: normalizeText(card.display_name)
      };
    })
  );

  const valid = candidates.filter(Boolean);
  return (
    valid.find((x) => x.keyNorm === needle || x.nameNorm === needle) ||
    valid.find((x) => x.keyNorm.includes(needle) || x.nameNorm.includes(needle)) ||
    null
  );
}

async function getTopPartyCards(repos, userId, limit = 5) {
  const owned = await repos.getUserCards(userId);
  const rows = await Promise.all(
    owned.map(async (u) => {
      const card = await repos.getCardByKey(u.card_key);
      if (!card) return null;
      return { userCard: u, card, power: calcCardPower(card, u) };
    })
  );
  return rows.filter(Boolean).sort((a, b) => b.power - a.power).slice(0, limit);
}

async function deployCommands(env) {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const payload = commandModules.map((mod) => mod.data.toJSON());

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), { body: payload });
    logInfo('Guild commands deployed', { guild: env.DISCORD_GUILD_ID });
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: payload });
    logInfo('Global commands deployed');
  }
}

async function main() {
  const env = loadEnv();
  const ownerIds = [...buildOwnerSet(env)];
  const db = createDb(env);
  const repos = createRepositories(db);
  const fontSetup = registerFonts(env);
  const primaryFontFamily = fontSetup.families.ui || 'sans-serif';
  const cardFontFamily = fontSetup.families.display || primaryFontFamily;
  const bossFontFamily = fontSetup.families.battle || primaryFontFamily;

  const summonService = createSummonService(repos);
  const cardService = createCardService(repos);
  const bossRenderService = createBossRenderService();
  const bossService = createBossService(repos, bossRenderService);
  const raidService = createRaidService(repos);
  const storeService = createStoreService(repos);
  const assetsService = createAssetsService(repos);
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
    primaryFontFamily,
    cardFontFamily,
    bossFontFamily
  };

  await deployCommands(env);
  logInfo('Owner IDs loaded', { ownerIds });

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
  });

  client.once(Events.ClientReady, (readyClient) => {
    logInfo(`SOULFALRES logged in as ${readyClient.user.tag}`);
    startBossSchedulers({ bossService, client: readyClient, env });
    startRaidSchedulers({ raidService, client: readyClient, env });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      try {
        const cid = interaction.customId || '';
        if (cid.startsWith('boss_join:')) {
          const bossId = cid.split(':')[1];
          await interaction.deferUpdate();
          try {
            const res = await ctx.bossService.joinActiveBoss(interaction.user.id, bossId);
            await interaction.message.edit(buildBossSpawnPayload(res.updated, res.spawnPng));
          } catch (err) {
            await interaction.followUp({ content: `Could not join boss: ${err.message}`, ephemeral: true });
          }
          return;
        }

        if (cid.startsWith('raid_')) {
          const [action, raidId] = cid.split(':');
          if (!raidId) return;
          await interaction.deferUpdate();

          const computePartyPower = async (userId) => {
            const party = await getTopPartyCards(ctx.repos, userId, 5);
            return party.reduce((sum, x) => sum + x.power, 0);
          };

          let snapshot = null;
          let headline = '';
          let statusText = '';
          let disableButtons = false;

          if (action === 'raid_team_create') {
            snapshot = await ctx.raidService.createTeam(interaction.user.id, raidId);
            headline = `🛡 Team created by <@${interaction.user.id}>`;
            statusText = `Raid: ${snapshot.preset.label}`;
          } else if (action === 'raid_team_join') {
            snapshot = await ctx.raidService.joinTeam(interaction.user.id, raidId);
            headline = `🛡 <@${interaction.user.id}> joined the team`;
            statusText = `Members: ${snapshot.state.users.length}/6`;
          } else if (action === 'raid_attack') {
            const result = await ctx.raidService.attackRaid(interaction.user.id, raidId, computePartyPower);
            snapshot = result;
            headline = `⚔️ <@${interaction.user.id}> attacked for ${result.damage}`;
            statusText = result.raidCleared
              ? `RAID CLEARED! Rewards sent.`
              : `Boss: ${result.currentBossKey} | Stage ${result.currentStage}/${result.totalStages} | HP ${result.state.hp_current}/${result.state.hp_max}`;
            disableButtons = Boolean(result.raidCleared);
          } else if (action === 'raid_status') {
            snapshot = await ctx.raidService.getRaidSnapshot(raidId);
            headline = `🧭 Raid Status`;
            statusText = `Boss: ${snapshot.state.boss_key} | Stage ${snapshot.state.stage_index + 1}/${snapshot.preset.stages.length} | HP ${snapshot.state.hp_current}/${snapshot.state.hp_max}`;
          } else {
            return;
          }

          const raidPng = await generateRaidLobbyPng({
            raidKey: snapshot.raidKey,
            preset: snapshot.preset,
            state: snapshot.state,
            fontFamily: ctx.bossFontFamily || ctx.primaryFontFamily
          }).catch(() => null);

          const payload = buildRaidPayload({
            raid: snapshot.raid,
            raidPng,
            title: headline,
            statusText,
            disabled: disableButtons
          });
          await interaction.message.edit(payload);
          return;
        }
      } catch {
        // Ignore button errors.
      }
    }

    if (interaction.isAutocomplete()) {
      const module = commandMap.get(interaction.commandName);
      if (!module?.autocomplete) return;
      try {
        await module.autocomplete(interaction, ctx);
      } catch (error) {
        const msg = String(error?.message || '');
        const code = Number(error?.code || 0);
        if (!msg.includes('Unknown interaction') && code !== 40060 && code !== 10062) {
          logWarn('Autocomplete failed', { command: interaction.commandName, error: msg });
        }
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const module = commandMap.get(interaction.commandName);
    if (!module) return replyError(interaction, 'Unknown command');

    try {
      await module.execute(interaction, ctx);
    } catch (error) {
      const code = Number(error?.code || 0);
      if (code === 10062 || code === 40060) {
        logWarn('Interaction already acknowledged', { command: interaction.commandName, code });
        return;
      }
      logError('Command execution failed', error);
      try {
        await replyError(interaction, 'Command failed unexpectedly.');
      } catch (replyErr) {
        const replyCode = Number(replyErr?.code || 0);
        if (replyCode !== 10062 && replyCode !== 40060) {
          logWarn('Failed to send error reply', { command: interaction.commandName, error: replyErr.message });
        }
      }
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;
    const raw = String(message.content || '').trim();
    if (!raw.toLowerCase().startsWith('attack')) return;

    const query = raw.slice('attack'.length).trim();
    if (!query) {
      await message.reply('Use: `attack <your card name>` or `attack cards`');
      return;
    }

    try {
      const bosses = await ctx.repos.getVisibleBosses();
      if (!bosses.length) {
        await message.reply('No active bosses to attack right now.');
        return;
      }

      const chosen = bosses[0];

      if (normalizeText(query) === 'cards') {
        const party = await getTopPartyCards(ctx.repos, message.author.id, 5);
        if (!party.length) {
          await message.reply('You have no cards in inventory.');
          return;
        }

        const totalPower = party.reduce((sum, p) => sum + p.power, 0);
        const result = await ctx.bossService.attackBoss(message.author.id, chosen.id, totalPower);
        const bossMeta = await ctx.repos.getBossByKey(result.updated.boss_key);
        const myDrop = (result.drops || []).find((x) => x.userId === message.author.id);

        const partyEntries = party.map((p) => ({
          key: p.card.key,
          name: p.card.display_name,
          power: p.power,
          imagePath: ctx.assetsService.getCardImagePath(p.card.key)
        }));

        try {
          const battlePng = await ctx.bossRenderService.generateBossPartyFightPng({
            bossName: bossMeta?.display_name || result.updated.boss_key,
            bossKey: result.updated.boss_key,
            anime: bossMeta?.anime || 'global',
            difficulty: result.updated.difficulty || 'easy',
            hpCurrent: result.updated.hp_current,
            hpMax: result.updated.hp_max,
            attackerTag: message.author.tag,
            totalDamage: result.damage,
            defeated: result.defeated,
            cardEntries: partyEntries,
            fontFamily: ctx.bossFontFamily || ctx.primaryFontFamily
          });

          const file = new AttachmentBuilder(battlePng, { name: `boss_party_${result.updated.id}.png` });
          await message.reply({
            content: [
              `? **Auto Team Attack** with ${party.length} cards`,
              `Damage: **${result.damage}**`,
              `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
              myDrop ? `Rewards: **+${myDrop.payout} ${myDrop.currency}**${myDrop.cardName ? ` | Card: **${myDrop.cardName}**` : ''}` : null
            ].filter(Boolean).join('\n'),
            files: [file]
          });
        } catch {
          await message.reply(
            [
              `? **Auto Team Attack** with ${party.length} cards`,
              `Damage: **${result.damage}**`,
              `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
              myDrop ? `Rewards: **+${myDrop.payout} ${myDrop.currency}**${myDrop.cardName ? ` | Card: **${myDrop.cardName}**` : ''}` : null
            ].filter(Boolean).join('\n')
          );
        }
        return;
      }

      const match = await findOwnedCardByQuery(ctx.repos, message.author.id, query);
      if (!match) {
        await message.reply(`Card not found in your inventory: \`${query}\``);
        return;
      }

      const power = Math.floor(match.card.base_power * (1 + match.userCard.ascension * 0.1) * (1 + match.userCard.card_level * 0.02));
      const result = await ctx.bossService.attackBoss(message.author.id, chosen.id, power);
      const bossMeta = await ctx.repos.getBossByKey(result.updated.boss_key);
      const myDrop = (result.drops || []).find((x) => x.userId === message.author.id);

      try {
        const battlePng = await ctx.bossRenderService.generateBossFightPng({
          bossName: bossMeta?.display_name || result.updated.boss_key,
          bossKey: result.updated.boss_key,
          anime: bossMeta?.anime || 'global',
          difficulty: result.updated.difficulty || 'easy',
          hpCurrent: result.updated.hp_current,
          hpMax: result.updated.hp_max,
          attackerTag: message.author.tag,
          cardName: match.card.display_name,
          damage: result.damage,
          defeated: result.defeated,
          fontFamily: ctx.bossFontFamily || ctx.primaryFontFamily
        });

        const file = new AttachmentBuilder(battlePng, { name: `boss_fight_${result.updated.id}.png` });
        await message.reply({
          content: [
            `**${match.card.display_name}** attacked **${bossMeta?.display_name || result.updated.boss_key}** for **${result.damage}** damage.`,
            `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
            myDrop ? `Rewards: **+${myDrop.payout} ${myDrop.currency}**${myDrop.cardName ? ` | Card: **${myDrop.cardName}**` : ''}` : null
          ].filter(Boolean).join('\n'),
          files: [file]
        });
      } catch {
        await message.reply(
          [
            `**${match.card.display_name}** attacked **${bossMeta?.display_name || result.updated.boss_key}** for **${result.damage}** damage.`,
            `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
            myDrop ? `Rewards: **+${myDrop.payout} ${myDrop.currency}**${myDrop.cardName ? ` | Card: **${myDrop.cardName}**` : ''}` : null
          ].filter(Boolean).join('\n')
        );
      }
    } catch (err) {
      await message.reply(`SOULFALRES Error: ${err.message || 'attack failed'}`);
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
