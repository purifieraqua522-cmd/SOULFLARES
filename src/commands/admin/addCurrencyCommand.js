const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { animes } = require('../../data/constants');

const data = new SlashCommandBuilder()
  .setName('addcurrency')
  .setDescription('Admin: add anime currency')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((o) => o.setName('user').setDescription('Target user').setRequired(true))
  .addStringOption((o) =>
    o
      .setName('anime')
      .setDescription('Anime')
      .setRequired(true)
      .addChoices(
        { name: 'One Piece', value: 'onepiece' },
        { name: 'Naruto', value: 'naruto' },
        { name: 'Bleach', value: 'bleach' },
        { name: 'JJK', value: 'jjk' }
      )
  )
  .addIntegerOption((o) => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1));

async function execute(interaction, ctx) {
  try {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return replyError(interaction, 'Only server admins can use this command.');
    }

    const user = interaction.options.getUser('user', true);
    const anime = interaction.options.getString('anime', true);
    const amount = interaction.options.getInteger('amount', true);
    const currency = animes[anime].currency;

    const next = await ctx.repos.addCurrency(user.id, currency, amount);
    return replySuccess(interaction, 'Currency Added', [
      `User: <@${user.id}>`,
      `Currency: **${currency}**`,
      `New Balance: **${next}**`
    ]);
  } catch (error) {
    return replyError(interaction, error.message || 'addcurrency failed');
  }
}

module.exports = { data, execute };
