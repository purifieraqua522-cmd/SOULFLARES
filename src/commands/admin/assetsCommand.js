const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('assets')
  .setDescription('Owner asset tools')
  .addSubcommand((s) => s.setName('sync').setDescription('Scan assets/cards and sync cards to DB'));

async function execute(interaction, ctx) {
  try {
    const ownerIds = new Set(
      [ctx.env.BOT_OWNER_ID, ...(ctx.env.BOT_OWNER_IDS || '').split(',').map((x) => x.trim())].filter(Boolean)
    );
    if (!ownerIds.has(interaction.user.id)) {
      return replyError(interaction, 'Only the bot owner can use this command.');
    }

    const sub = interaction.options.getSubcommand();
    if (sub === 'sync') {
      const result = await ctx.assetsService.syncCardsFromAssets();
      return replySuccess(interaction, 'Assets Synced', [
        `Scanned: **${result.scanned}**`,
        `Upserted: **${result.upserted}**`,
        'Source: `assets/cards/<anime>/<file>.png`'
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'assets command failed');
  }
}

module.exports = { data, execute };
