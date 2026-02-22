const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { isOwnerOrAdmin } = require('../../core/owners');

const data = new SlashCommandBuilder()
  .setName('assets')
  .setDescription('Owner asset tools')
  .addSubcommand((s) => s.setName('sync').setDescription('Scan assets/cards and sync cards to DB'));

async function execute(interaction, ctx) {
  try {
    const { isOwner, isAdmin } = isOwnerOrAdmin(interaction, ctx.env);
    if (!isOwner && !isAdmin) {
      return replyError(interaction, 'Only the bot owner or an administrator can use this command.');
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
