const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { animes } = require('../../data/constants');

const data = new SlashCommandBuilder()
  .setName('spawnboss')
  .setDescription('Owner: spawn bosses manually')
  .addSubcommand((s) => s.setName('list').setDescription('List all available bosses by type and anime'))
  .addSubcommand((s) =>
    s
      .setName('normal')
      .setDescription('Spawn a normal boss')
      .addStringOption((o) =>
        o
          .setName('anime')
          .setDescription('Choose anime')
          .setRequired(true)
          .addChoices(
            { name: 'One Piece', value: 'onepiece' },
            { name: 'Naruto', value: 'naruto' },
            { name: 'Bleach', value: 'bleach' },
            { name: 'JJK', value: 'jjk' }
          )
      )
      .addStringOption((o) => o.setName('boss').setDescription('Choose boss').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s
      .setName('event')
      .setDescription('Spawn an event boss')
      .addStringOption((o) =>
        o
          .setName('anime')
          .setDescription('Choose anime')
          .setRequired(true)
          .addChoices(
            { name: 'One Piece', value: 'onepiece' },
            { name: 'Naruto', value: 'naruto' },
            { name: 'Bleach', value: 'bleach' },
            { name: 'JJK', value: 'jjk' }
          )
      )
      .addStringOption((o) => o.setName('boss').setDescription('Choose event boss').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s
      .setName('super')
      .setDescription('Spawn a super boss')
      .addStringOption((o) =>
        o
          .setName('anime')
          .setDescription('Choose anime')
          .setRequired(true)
          .addChoices(
            { name: 'One Piece', value: 'onepiece' },
            { name: 'Naruto', value: 'naruto' },
            { name: 'Bleach', value: 'bleach' },
            { name: 'JJK', value: 'jjk' }
          )
      )
      .addStringOption((o) => o.setName('boss').setDescription('Choose super boss').setRequired(true).setAutocomplete(true))
  );

async function execute(interaction, ctx) {
  try {
    if (interaction.user.id !== ctx.env.BOT_OWNER_ID) {
      return replyError(interaction, 'Only the bot owner can use this command.');
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const bosses = await ctx.bossService.listBossCatalog();
      if (!bosses.length) return replySuccess(interaction, 'Boss Catalog', ['No bosses found in the database.']);

      const animeList = ['onepiece', 'naruto', 'bleach', 'jjk'];
      const lines = [];

      for (const anime of animeList) {
        const animeName = animes[anime]?.label || anime;
        lines.push(`**${animeName}**`);

        const normalBosses = bosses.filter((b) => b.anime === anime && !b.is_event && !b.is_super);
        const eventBosses = bosses.filter((b) => b.anime === anime && b.is_event && !b.is_super);
        const superBosses = bosses.filter((b) => b.anime === anime && b.is_super);

        if (normalBosses.length) {
          lines.push('  *Normal:*');
          normalBosses.forEach((b) => lines.push(`    - ${b.display_name}`));
        }
        if (eventBosses.length) {
          lines.push('  *Event:*');
          eventBosses.forEach((b) => lines.push(`    - ${b.display_name}`));
        }
        if (superBosses.length) {
          lines.push('  *Super:*');
          superBosses.forEach((b) => lines.push(`    - ${b.display_name}`));
        }
        lines.push('');
      }

      return replySuccess(interaction, 'Boss Catalog', lines.slice(0, 30));
    }

    if (['normal', 'event', 'super'].includes(sub)) {
      const anime = interaction.options.getString('anime', true);
      const bossDisplay = interaction.options.getString('boss', true);

      const result = await ctx.bossService.spawnSpecificBoss(bossDisplay);
      const { activeBoss, spawnPng } = result;

      // Reply with PNG if available
      if (spawnPng) {
        const { AttachmentBuilder } = require('discord.js');
        const file = new AttachmentBuilder(spawnPng, { name: `boss_spawn_${activeBoss.boss_key}.png` });
        if (interaction.deferred || interaction.replied) {
          return interaction.editReply({ files: [file] });
        }
        return interaction.reply({ files: [file] });
      }

      // Fallback to text response
      return replySuccess(interaction, 'Boss Spawned', [
        `Type: **${sub.toUpperCase()}**`,
        `Anime: **${animes[anime]?.label || anime}**`,
        `Boss: **${activeBoss.boss_key}**`,
        `HP: **${activeBoss.hp_current}/${activeBoss.hp_max}**`,
        `ID: \`${activeBoss.id}\``
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'spawnboss failed');
  }
}

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    if (focused.name !== 'boss') return interaction.respond([]);

    const sub = interaction.options.getSubcommand();
    const anime = interaction.options.getString('anime');

    if (!anime) return interaction.respond([]);

    // Use a cached boss list if available, otherwise fetch from DB
    const allBosses = await Promise.race([
      ctx.bossService.listBossCatalog(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
    ]).catch(() => []);

    if (!allBosses.length) return interaction.respond([]);

    let filteredBosses = allBosses.filter((b) => b.anime === anime);

    if (sub === 'normal') {
      filteredBosses = filteredBosses.filter((b) => !b.is_event && !b.is_super);
    } else if (sub === 'event') {
      filteredBosses = filteredBosses.filter((b) => b.is_event && !b.is_super);
    } else if (sub === 'super') {
      filteredBosses = filteredBosses.filter((b) => b.is_super);
    }

    const query = String(focused.value || '').toLowerCase();
    const choices = filteredBosses
      .filter((b) => {
        const label = `${b.display_name}`.toLowerCase();
        return !query || label.includes(query);
      })
      .slice(0, 25)
      .map((b) => ({
        name: b.display_name,
        value: b.boss_key
      }));

    return interaction.respond(choices);
  } catch (err) {
    // Silently fail and return empty suggestions to prevent timeout errors
    try {
      return interaction.respond([]);
    } catch {
      // Already responded or interaction expired
    }
  }
}

module.exports = { data, execute, autocomplete };
