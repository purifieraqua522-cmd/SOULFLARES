const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('summon')
  .setDescription('Anime summon / pack opening')
  .addStringOption((o) =>
    o
      .setName('anime')
      .setDescription('Choose anime banner')
      .setRequired(true)
      .addChoices(
        { name: 'One Piece', value: 'onepiece' },
        { name: 'Naruto', value: 'naruto' },
        { name: 'Bleach', value: 'bleach' },
        { name: 'JJK', value: 'jjk' }
      )
  );

async function execute(interaction, ctx) {
  try {
    const anime = interaction.options.getString('anime', true);
    await ctx.repos.ensureProfile(interaction.user.id);
    const result = await ctx.summonService.summon(interaction.user.id, anime);

    return replySuccess(interaction, 'Summon Result', [
      `Anime: **${anime}**`,
      `Pulled: **${result.card.display_name}**`,
      `Rarity: **${result.rarity}**`,
      `Cost: **${result.cost} ${result.currency}**`
    ]);
  } catch (error) {
    return replyError(interaction, error.message || 'Summon failed');
  }
}

module.exports = { data, execute };
