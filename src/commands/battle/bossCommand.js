const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('boss')
  .setDescription('Boss controls')
  .addSubcommand((s) => s.setName('list').setDescription('Show active bosses'))
  .addSubcommand((s) =>
    s
      .setName('attack')
      .setDescription('Attack boss with one card')
      .addStringOption((o) => o.setName('boss_id').setDescription('Boss ID').setRequired(true))
      .addStringOption((o) => o.setName('card_key').setDescription('Your card key').setRequired(true))
  )
  .addSubcommand((s) =>
    s
      .setName('vote')
      .setDescription('Vote/start with difficulty (min 3 players)')
      .addStringOption((o) => o.setName('boss_id').setDescription('Boss ID').setRequired(true))
      .addStringOption((o) =>
        o
          .setName('difficulty')
          .setDescription('Difficulty')
          .setRequired(true)
          .addChoices({ name: 'Easy', value: 'easy' }, { name: 'Hard', value: 'hard' }, { name: 'Nightmare', value: 'nightmare' })
      )
      .addStringOption((o) => o.setName('player_ids').setDescription('Comma separated user IDs').setRequired(true))
  );

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  try {
    if (sub === 'list') {
      const bosses = await ctx.repos.getOpenBosses();
      if (!bosses.length) return replySuccess(interaction, 'Boss Liste', ['Keine aktiven Bosse.']);

      return replySuccess(
        interaction,
        'Aktive Bosse',
        bosses.slice(0, 10).map((b) => `ID: \`${b.id}\` | ${b.boss_key} | HP: ${b.hp_current}/${b.hp_max} | ${b.state}`)
      );
    }

    if (sub === 'vote') {
      const bossId = interaction.options.getString('boss_id', true);
      const difficulty = interaction.options.getString('difficulty', true);
      const ids = interaction.options
        .getString('player_ids', true)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      if (!ids.includes(userId)) ids.push(userId);
      const updated = await ctx.bossService.voteAndStart(bossId, difficulty, ids);
      return replySuccess(interaction, 'Boss gestartet', [
        `Boss ID: \`${updated.id}\``,
        `Difficulty: **${difficulty}**`,
        `Teilnehmer: **${ids.length}**`
      ]);
    }

    if (sub === 'attack') {
      const bossId = interaction.options.getString('boss_id', true);
      const cardKey = interaction.options.getString('card_key', true);
      const card = await ctx.repos.getCardByKey(cardKey);
      const owned = await ctx.repos.getUserCard(userId, cardKey);
      if (!card || !owned) return replyError(interaction, 'Card nicht gefunden oder nicht im Besitz.');

      const power = Math.floor(card.base_power * (1 + owned.ascension * 0.1) * (1 + owned.card_level * 0.02));
      const result = await ctx.bossService.attackBoss(userId, bossId, power);

      return replySuccess(interaction, 'Boss Attacke', [
        `Schaden: **${result.damage}**`,
        `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
        `Status: **${result.updated.state}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Boss command failed');
  }
}

module.exports = { data, execute };
