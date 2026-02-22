const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('boss')
  .setDescription('Boss controls')
  .addSubcommand((s) => s.setName('list').setDescription('Show active bosses'))
  .addSubcommand((s) =>
    s
      .setName('attack')
      .setDescription('Attack boss with one card')
      .addStringOption((o) => o.setName('card_key').setDescription('Your card key').setRequired(true))
      .addStringOption((o) => o.setName('boss').setDescription('Choose active boss (optional)').setRequired(false).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s
      .setName('vote')
      .setDescription('Vote/start with difficulty (min 3 players)')
      .addStringOption((o) =>
        o
          .setName('difficulty')
          .setDescription('Difficulty')
          .setRequired(true)
          .addChoices({ name: 'Easy', value: 'easy' }, { name: 'Hard', value: 'hard' }, { name: 'Nightmare', value: 'nightmare' })
      )
      .addStringOption((o) => o.setName('boss').setDescription('Choose open boss (optional)').setRequired(false).setAutocomplete(true))
      .addStringOption((o) => o.setName('player_ids').setDescription('Optional comma separated user IDs').setRequired(false))
  );

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  try {
    if (sub === 'list') {
      const bosses = await ctx.repos.getVisibleBosses();
      if (!bosses.length) return replySuccess(interaction, 'Boss List', ['No active bosses.']);

      return replySuccess(
        interaction,
        'Active Bosses',
        bosses
          .slice(0, 10)
          .map((b) => `ID: \`${b.id}\` | ${b.boss_key} | HP: ${b.hp_current}/${b.hp_max} | ${b.state} | ${b.difficulty}`)
      );
    }

    if (sub === 'vote') {
      const selected = interaction.options.getString('boss');
      const difficulty = interaction.options.getString('difficulty', true);
      const rawIds = interaction.options.getString('player_ids') || '';
      const ids = rawIds
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      const openBosses = await ctx.repos.getOpenBosses();
      if (!openBosses.length) return replyError(interaction, 'No open bosses to start.');
      const chosen = selected
        ? openBosses.find((b) => b.id === selected || b.boss_key === selected)
        : openBosses[0];
      if (!chosen) return replyError(interaction, 'Selected boss is not open.');

      if (!ids.includes(userId)) ids.push(userId);
      const updated = await ctx.bossService.voteAndStart(chosen.id, difficulty, ids);
      return replySuccess(interaction, 'Boss Started', [
        `Boss ID: \`${updated.id}\``,
        `Difficulty: **${difficulty}**`,
        `Participants: **${ids.length}**`
      ]);
    }

    if (sub === 'attack') {
      await interaction.deferReply();

      const selected = interaction.options.getString('boss');
      const cardKey = interaction.options.getString('card_key', true);
      const card = await ctx.repos.getCardByKey(cardKey);
      const owned = await ctx.repos.getUserCard(userId, cardKey);
      if (!card || !owned) return replyError(interaction, 'Card not found or not owned.');
      const bosses = await ctx.repos.getVisibleBosses();
      if (!bosses.length) return replyError(interaction, 'No active bosses to attack.');
      const chosen = selected
        ? bosses.find((b) => b.id === selected || b.boss_key === selected)
        : bosses[0];
      if (!chosen) return replyError(interaction, 'Selected boss not found.');

      const power = Math.floor(card.base_power * (1 + owned.ascension * 0.1) * (1 + owned.card_level * 0.02));
      const result = await ctx.bossService.attackBoss(userId, chosen.id, power);
      const bossMeta = await ctx.repos.getBossByKey(result.updated.boss_key);

      try {
        const battlePng = await ctx.bossRenderService.generateBossFightPng({
          bossName: bossMeta?.display_name || result.updated.boss_key,
          bossKey: result.updated.boss_key,
          anime: bossMeta?.anime || 'global',
          difficulty: result.updated.difficulty || 'easy',
          hpCurrent: result.updated.hp_current,
          hpMax: result.updated.hp_max,
          attackerTag: interaction.user.tag,
          cardName: card.display_name,
          damage: result.damage,
          defeated: result.defeated,
          fontFamily: ctx.primaryFontFamily
        });

        const file = new AttachmentBuilder(battlePng, { name: `boss_fight_${result.updated.id}.png` });
        return interaction.editReply({
          content: [
            `Boss: **${bossMeta?.display_name || result.updated.boss_key}**`,
            `Damage: **${result.damage}**`,
            `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
            `Status: **${result.updated.state}**`
          ].join('\n'),
          files: [file]
        });
      } catch {
        return replySuccess(interaction, 'Boss Attack', [
          `Damage: **${result.damage}**`,
          `HP: **${result.updated.hp_current}/${result.updated.hp_max}**`,
          `Status: **${result.updated.state}**`,
          'PNG rendering fallback used.'
        ]);
      }
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Boss command failed');
  }
}

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    if (!['boss', 'card_key'].includes(focused.name)) return interaction.respond([]);

    const query = String(focused.value || '').toLowerCase();
    if (focused.name === 'card_key') {
      const owned = await ctx.repos.getUserCards(interaction.user.id);
      const choices = (
        await Promise.all(
          owned.map(async (u) => {
            const card = await ctx.repos.getCardByKey(u.card_key);
            return {
              name: `${card?.display_name || u.card_key} | x${u.copies} | L${u.card_level}`,
              value: u.card_key
            };
          })
        )
      )
        .filter((x) => x.value.toLowerCase().includes(query) || x.name.toLowerCase().includes(query))
        .slice(0, 25);
      return interaction.respond(choices);
    }

    const sub = interaction.options.getSubcommand();
    const bosses = sub === 'vote' ? await ctx.repos.getOpenBosses() : await ctx.repos.getVisibleBosses();
    const withMeta = await Promise.all(
      bosses.map(async (b) => ({
        row: b,
        meta: await ctx.repos.getBossByKey(b.boss_key)
      }))
    );

    const choices = withMeta
      .filter((x) => {
        const label = `${x.meta?.display_name || x.row.boss_key} ${x.row.boss_key} ${x.row.id}`.toLowerCase();
        return !query || label.includes(query);
      })
      .slice(0, 25)
      .map((x) => ({
        name: `${x.meta?.display_name || x.row.boss_key} | ${x.row.state} | HP ${x.row.hp_current}/${x.row.hp_max}`,
        value: x.row.id
      }));

    return interaction.respond(choices);
  } catch {
    return interaction.respond([]);
  }
}

module.exports = { data, execute, autocomplete };
