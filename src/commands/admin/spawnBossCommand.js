const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('spawnboss')
  .setDescription('Owner: spawn bosses manually')
  .addSubcommand((s) => s.setName('list').setDescription('List all available boss keys'))
  .addSubcommand((s) =>
    s
      .setName('spawn')
      .setDescription('Spawn a boss by key or by anime pool')
      .addStringOption((o) => o.setName('boss_key').setDescription('Choose boss (optional)').setRequired(false).setAutocomplete(true))
      .addStringOption((o) =>
        o
          .setName('anime')
          .setDescription('Fallback anime pool if no boss_key is set')
          .setRequired(false)
          .addChoices(
            { name: 'One Piece', value: 'onepiece' },
            { name: 'Naruto', value: 'naruto' },
            { name: 'Bleach', value: 'bleach' },
            { name: 'JJK', value: 'jjk' }
          )
      )
      .addBooleanOption((o) => o.setName('super').setDescription('Use super boss from anime pool').setRequired(false))
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

      return replySuccess(
        interaction,
        'Boss Catalog',
        bosses.map((b) => `- \`${b.boss_key}\` | ${b.display_name} | anime=${b.anime} | super=${b.is_super ? 'yes' : 'no'}`).slice(0, 25)
      );
    }

    if (sub === 'spawn') {
      const bossKey = interaction.options.getString('boss_key');
      const anime = interaction.options.getString('anime');
      const isSuper = interaction.options.getBoolean('super') || false;

      if (!bossKey && !anime) {
        return replyError(interaction, 'Provide `boss_key` or `anime`.');
      }

      const boss = bossKey
        ? await ctx.bossService.spawnSpecificBoss(bossKey)
        : await ctx.bossService.spawnScheduledBoss({ anime, isSuper });

      return replySuccess(interaction, 'Boss Spawned', [
        `ID: \`${boss.id}\``,
        `Boss Key: **${boss.boss_key}**`,
        `HP: **${boss.hp_current}/${boss.hp_max}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'spawnboss failed');
  }
}

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    if (focused.name !== 'boss_key') return interaction.respond([]);
    const query = String(focused.value || '').toLowerCase();
    const bosses = await ctx.bossService.listBossCatalog();
    const choices = bosses
      .filter((b) => {
        const label = `${b.boss_key} ${b.display_name} ${b.anime}`.toLowerCase();
        return !query || label.includes(query);
      })
      .slice(0, 25)
      .map((b) => ({
        name: `${b.display_name} | ${b.anime} | ${b.is_super ? 'super' : 'normal'}`,
        value: b.boss_key
      }));
    return interaction.respond(choices);
  } catch {
    return interaction.respond([]);
  }
}

module.exports = { data, execute, autocomplete };
