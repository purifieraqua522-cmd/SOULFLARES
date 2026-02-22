const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View your inventory')
  .addStringOption((o) =>
    o
      .setName('anime')
      .setDescription('Optional anime filter')
      .addChoices(
        { name: 'One Piece', value: 'onepiece' },
        { name: 'Naruto', value: 'naruto' },
        { name: 'Bleach', value: 'bleach' },
        { name: 'JJK', value: 'jjk' }
      )
  );

async function execute(interaction, ctx) {
  try {
    const anime = interaction.options.getString('anime');
    const cards = await ctx.repos.getUserCards(interaction.user.id);
    const materials = await ctx.repos.getMaterials(interaction.user.id);

    const filtered = anime
      ? await Promise.all(cards.map(async (c) => ({ owner: c, card: await ctx.repos.getCardByKey(c.card_key) }))).then((x) =>
          x.filter((entry) => entry.card?.anime === anime)
        )
      : await Promise.all(cards.map(async (c) => ({ owner: c, card: await ctx.repos.getCardByKey(c.card_key) })));

    const cardLines = filtered.length
      ? filtered.slice(0, 12).map((x) => `- ${x.card.display_name} x${x.owner.copies} | Lvl ${x.owner.card_level} | Asc +${x.owner.ascension}`)
      : ['- Keine Karten'];
    const matLines = materials.length
      ? materials.slice(0, 8).map((m) => `- ${m.material_key}: ${m.qty}`)
      : ['- Keine Materialien'];

    return replySuccess(interaction, 'Inventory', ['**Cards**', ...cardLines, '**Materials**', ...matLines]);
  } catch (error) {
    return replyError(interaction, error.message || 'Inventory failed');
  }
}

module.exports = { data, execute };
