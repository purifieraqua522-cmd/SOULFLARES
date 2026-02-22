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
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription('Buy store item')
      .addStringOption((o) => o.setName('item_key').setRequired(true).setDescription('Choose store item').setAutocomplete(true))
  );

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
      const result = await ctx.storeService.buy(interaction.user.id, itemKey);
      const current = result.wallet?.[result.item.price_currency] ?? 0;
      return replySuccess(interaction, 'Purchase Complete', [
        `Item: **${result.item.display_name}**`,
        `Price: **${result.item.price_amount} ${result.item.price_currency}**`,
        `Effect: **${result.effect}**`,
        `Balance: **${current} ${result.item.price_currency}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Store failed');
  }
}

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    if (focused.name !== 'item_key') return interaction.respond([]);
    const query = String(focused.value || '').toLowerCase();
    const items = await ctx.storeService.list();
    const choices = items
      .filter((i) => {
        const label = `${i.item_key} ${i.display_name} ${i.price_currency}`.toLowerCase();
        return !query || label.includes(query);
      })
      .slice(0, 25)
      .map((i) => ({
        name: `${i.display_name} | ${i.price_amount} ${i.price_currency}`,
        value: i.item_key
      }));
    return interaction.respond(choices);
  } catch {
    return interaction.respond([]);
  }
}

module.exports = { data, execute, autocomplete };
