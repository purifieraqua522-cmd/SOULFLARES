const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { animes } = require('../../data/constants');

const data = new SlashCommandBuilder()
  .setName('clash')
  .setDescription('Currency gamble clash')
  .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
  .addStringOption((o) =>
    o
      .setName('anime')
      .setDescription('Currency source anime')
      .setRequired(true)
      .addChoices(
        { name: 'One Piece', value: 'onepiece' },
        { name: 'Naruto', value: 'naruto' },
        { name: 'Bleach', value: 'bleach' },
        { name: 'JJK', value: 'jjk' }
      )
  )
  .addIntegerOption((o) => o.setName('amount').setDescription('Wager amount').setRequired(true).setMinValue(1));

async function execute(interaction, ctx) {
  try {
    const target = interaction.options.getUser('target', true);
    const anime = interaction.options.getString('anime', true);
    const amount = interaction.options.getInteger('amount', true);
    if (target.id === interaction.user.id) return replyError(interaction, 'You cannot clash your own account.');

    const currency = animes[anime].currency;
    await ctx.repos.spendCurrency(interaction.user.id, currency, amount);

    const won = Math.random() > 0.47;
    if (won) {
      const payout = Math.floor(amount * 1.9);
      const balance = await ctx.repos.addCurrency(interaction.user.id, currency, payout);
      return replySuccess(interaction, 'Clash Win', [
        `Currency: **${currency}**`,
        `Won: **${payout}**`,
        `Balance: **${balance}**`,
        `Opponent: **${target.username}**`
      ]);
    }

    const balance = (await ctx.repos.getWallet(interaction.user.id))[currency];
    return replySuccess(interaction, 'Clash Lost', [
      `Currency: **${currency}**`,
      `Lost: **${amount}**`,
      `Balance: **${balance}**`,
      `Opponent: **${target.username}**`
    ]);
  } catch (error) {
    return replyError(interaction, error.message || 'Clash failed');
  }
}

module.exports = { data, execute };
