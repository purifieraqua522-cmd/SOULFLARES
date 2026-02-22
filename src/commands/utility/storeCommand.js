const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('store')
  .setDescription('Store interactions')
  .addSubcommand((s) =>
    s
      .setName('view')
      .setDescription('List store items')
      .addStringOption((o) =>
        o
          .setName('anime')
          .setDescription('Optional anime scope')
          .addChoices(
            { name: 'One Piece', value: 'onepiece' },
            { name: 'Naruto', value: 'naruto' },
            { name: 'Bleach', value: 'bleach' },
            { name: 'JJK', value: 'jjk' }
          )
      )
  )
  .addSubcommand((s) => s.setName('buy').setDescription('Buy store item').addStringOption((o) => o.setName('item_key').setRequired(true).setDescription('Store item key')));

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  try {
    if (sub === 'view') {
      const anime = interaction.options.getString('anime');
      const items = await ctx.storeService.list(anime);
      if (!items.length) return replySuccess(interaction, 'Store', ['No items found.']);
      return replySuccess(
        interaction,
        'Store Items',
        items.slice(0, 15).map((i) => `- \`${i.item_key}\` | ${i.display_name} | ${i.price_amount} ${i.price_currency}`)
      );
    }

    if (sub === 'buy') {
      const itemKey = interaction.options.getString('item_key', true);
      const item = await ctx.storeService.buy(interaction.user.id, itemKey);
      return replySuccess(interaction, 'Purchase Complete', [
        `Item: **${item.display_name}**`,
        `Price: **${item.price_amount} ${item.price_currency}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Store failed');
  }
}

module.exports = { data, execute };
