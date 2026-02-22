const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { calcCardPower } = require('../../services/progressionService');

const data = new SlashCommandBuilder()
  .setName('card')
  .setDescription('Card management')
  .addSubcommand((s) =>
    s
      .setName('view')
      .setDescription('Render card as PNG')
      .addStringOption((o) => o.setName('card_key').setDescription('Choose your card').setRequired(true).setAutocomplete(true))
      .addStringOption((o) => o.setName('custom_name').setDescription('Optional custom display name').setRequired(false))
  )
  .addSubcommand((s) =>
    s.setName('info').setDescription('Card detail').addStringOption((o) => o.setName('card_key').setDescription('Choose your card').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s.setName('evolve').setDescription('Evolve a card').addStringOption((o) => o.setName('card_key').setDescription('Choose your card').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s.setName('merge').setDescription('Merge duplicate cards').addStringOption((o) => o.setName('card_key').setDescription('Choose your card').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s.setName('fuse').setDescription('Run fusion recipe').addStringOption((o) => o.setName('fusion_key').setDescription('Choose fusion').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s.setName('sacrifice').setDescription('Sacrifice card for currency').addStringOption((o) => o.setName('card_key').setDescription('Choose your card').setRequired(true).setAutocomplete(true))
  );

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  try {
    await ctx.repos.ensureProfile(userId);

    if (sub === 'view') {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }
      const cardKey = interaction.options.getString('card_key', true);
      const customName = interaction.options.getString('custom_name');
      const card = await ctx.repos.getCardByKey(cardKey);
      const userCard = await ctx.repos.getUserCard(userId, cardKey);
      if (!card || !userCard) return replyError(interaction, 'Card not found in your inventory.');

      const power = calcCardPower(card, userCard);
      const imagePath = ctx.assetsService.getCardImagePath(cardKey);
      const png = await ctx.pngService.generateCardPng({
        card,
        ownerTag: interaction.user.tag,
        power,
        ascension: userCard.ascension,
        customName,
        imagePath,
        fontFamily: ctx.primaryFontFamily
      });

      const file = new AttachmentBuilder(png, { name: `${card.key}.png` });
      return interaction.editReply({ files: [file] });
    }

    if (sub === 'info') {
      const cardKey = interaction.options.getString('card_key', true);
      const card = await ctx.repos.getCardByKey(cardKey);
      const owned = await ctx.repos.getUserCard(userId, cardKey);
      if (!card) return replyError(interaction, 'Unknown card key.');

      return replySuccess(interaction, `Card Info: ${card.display_name}`, [
        `Anime: **${card.anime}**`,
        `Rarity: **${card.rarity}**`,
        `Tier: **${card.evolution_tier}/3**`,
        `Base Power: **${card.base_power}**`,
        `Owned Copies: **${owned?.copies || 0}**`
      ]);
    }

    if (sub === 'evolve') {
      const cardKey = interaction.options.getString('card_key', true);
      const result = await ctx.cardService.evolve(userId, cardKey);
      return replySuccess(interaction, 'Evolution Complete', [
        `From: **${result.from.display_name}**`,
        `To: **${result.to.display_name}**`,
        `Currency Used: **${result.currency}**`
      ]);
    }

    if (sub === 'merge') {
      const cardKey = interaction.options.getString('card_key', true);
      const result = await ctx.cardService.merge(userId, cardKey);
      return replySuccess(interaction, 'Merge Complete', [
        `Card: **${result.card.display_name}**`,
        `Ascension: **+${result.ascension}**`
      ]);
    }

    if (sub === 'fuse') {
      const fusionKey = interaction.options.getString('fusion_key', true);
      const result = await ctx.cardService.fuse(userId, fusionKey);
      return replySuccess(interaction, 'Fusion Complete', [
        `Fusion: **${result.fusionKey}**`,
        `Result Card Key: **${result.resultCardKey}**`
      ]);
    }

    if (sub === 'sacrifice') {
      const cardKey = interaction.options.getString('card_key', true);
      const result = await ctx.cardService.sacrifice(userId, cardKey);
      return replySuccess(interaction, 'Card Sacrificed', [
        `Reward: **${result.payout} ${result.currency}**`,
        `New Balance: **${result.balance}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Card command failed');
  }
}

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    const query = String(focused.value || '').toLowerCase();

    if (focused.name === 'card_key') {
      const owned = await ctx.repos.getUserCards(interaction.user.id);
      const choices = owned
        .map((u) => ({
          name: `${u.card_key} | x${u.copies} | L${u.card_level} A+${u.ascension}`,
          value: u.card_key
        }))
        .filter((x) => x.value.toLowerCase().includes(query) || x.name.toLowerCase().includes(query))
        .slice(0, 25);

      return interaction.respond(choices);
    }

    if (focused.name === 'fusion_key') {
      const fusions = await ctx.repos.getFusions();
      const choices = fusions
        .filter((f) => !query || f.fusion_key.toLowerCase().includes(query))
        .slice(0, 25)
        .map((f) => ({ name: f.fusion_key, value: f.fusion_key }));
      return interaction.respond(choices);
    }

    return interaction.respond([]);
  } catch {
    return interaction.respond([]);
  }
}

module.exports = { data, execute, autocomplete };
