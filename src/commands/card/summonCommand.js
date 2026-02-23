const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { replyError } = require('../../ui/responders');
const { calcCardPower } = require('../../services/progressionService');

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

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    const openingPng = await ctx.pngService.generateSummonOpeningPng({
      anime,
      rarityHint: '???',
      fontFamily: ctx.cardFontFamily || ctx.primaryFontFamily
    });
    const openingFile = new AttachmentBuilder(openingPng, { name: `summon_opening_${anime}.png` });
    await interaction.editReply({
      content: 'Opening animation...',
      files: [openingFile]
    });

    await new Promise((resolve) => setTimeout(resolve, 1300));

    const result = await ctx.summonService.summon(interaction.user.id, anime);
    const userCard = await ctx.repos.getUserCard(interaction.user.id, result.card.key);
    const power = calcCardPower(result.card, userCard || { card_level: 1, ascension: 0 });
    const imagePath = ctx.assetsService.getCardImagePath(result.card.key);
    const revealPng = await ctx.pngService.generateCardPng({
      card: result.card,
      ownerTag: interaction.user.tag,
      power,
      ascension: userCard?.ascension || 0,
      customName: null,
      imagePath,
      fontFamily: ctx.cardFontFamily || ctx.primaryFontFamily
    });
    const revealFile = new AttachmentBuilder(revealPng, { name: `summon_result_${result.card.key}.png` });

    return interaction.editReply({
      content: [
        `?? **Summon Complete**`,
        `Anime: **${anime.toUpperCase()}**`,
        `Pulled: **${result.card.display_name}**`,
        `Rarity: **${result.rarity.toUpperCase()}**`,
        `Power: **${power}**`,
        `Cost: **${result.cost} ${result.currency}**`
      ].join('\n'),
      files: [revealFile]
    });
  } catch (error) {
    return replyError(interaction, error.message || 'Summon failed');
  }
}

module.exports = { data, execute };