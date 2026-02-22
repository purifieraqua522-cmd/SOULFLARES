const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('fight')
  .setDescription('Duel another player')
  .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
  .addIntegerOption((o) => o.setName('stake').setDescription('Optional currency stake').setMinValue(0));

async function execute(interaction, ctx) {
  try {
    const target = interaction.options.getUser('target', true);
    const stake = interaction.options.getInteger('stake') || 0;
    if (target.id === interaction.user.id) return replyError(interaction, 'You cannot fight yourself.');

    const myCards = await ctx.repos.getUserCards(interaction.user.id);
    const theirCards = await ctx.repos.getUserCards(target.id);
    const myPower = myCards.reduce((sum, c) => sum + c.card_level * 30 + c.ascension * 60, 0);
    const theirPower = theirCards.reduce((sum, c) => sum + c.card_level * 30 + c.ascension * 60, 0);

    const rollA = myPower + Math.floor(Math.random() * 250);
    const rollB = theirPower + Math.floor(Math.random() * 250);
    const winner = rollA >= rollB ? interaction.user : target;

    return replySuccess(interaction, 'Fight Result', [
      `Duel: **${interaction.user.username} vs ${target.username}**`,
      `Score: **${rollA} - ${rollB}**`,
      `Winner: **${winner.username}**`,
      `Stake: **${stake}** (manual payout)`
    ]);
  } catch (error) {
    return replyError(interaction, error.message || 'Fight failed');
  }
}

module.exports = { data, execute };
