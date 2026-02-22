const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  AttachmentBuilder
} = require('discord.js');
const { replyError } = require('../../ui/responders');
const { animes } = require('../../data/constants');
const { isOwnerOrAdmin } = require('../../core/owners');

const TYPE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Event', value: 'event' },
  { label: 'Super', value: 'super' }
];

const ANIME_OPTIONS = [
  { label: 'One Piece', value: 'onepiece' },
  { label: 'Naruto', value: 'naruto' },
  { label: 'Bleach', value: 'bleach' },
  { label: 'JJK', value: 'jjk' }
];

const data = new SlashCommandBuilder().setName('spawnboss').setDescription('Spawn bosses from one interactive menu');

function filterBosses(catalog, anime, type) {
  return catalog.filter((boss) => {
    if (boss.anime !== anime) return false;
    if (type === 'normal') return !boss.is_event && !boss.is_super;
    if (type === 'event') return boss.is_event && !boss.is_super;
    if (type === 'super') return boss.is_super;
    return false;
  });
}

function normalizeState(state, catalog) {
  let filtered = filterBosses(catalog, state.anime, state.type);

  if (!filtered.length) {
    for (const anime of ANIME_OPTIONS.map((x) => x.value)) {
      for (const type of TYPE_OPTIONS.map((x) => x.value)) {
        const next = filterBosses(catalog, anime, type);
        if (next.length) {
          state.anime = anime;
          state.type = type;
          filtered = next;
          break;
        }
      }
      if (filtered.length) break;
    }
  }

  if (!filtered.find((x) => x.boss_key === state.bossKey)) {
    state.bossKey = filtered[0]?.boss_key || null;
  }

  return filtered;
}

function buildView(state, catalog, disabled = false) {
  const filtered = normalizeState(state, catalog);
  const selected = filtered.find((x) => x.boss_key === state.bossKey) || null;

  const typeRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('spawnboss_type')
      .setPlaceholder('Select boss type')
      .setDisabled(disabled)
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        TYPE_OPTIONS.map((opt) => ({
          label: opt.label,
          value: opt.value,
          default: state.type === opt.value
        }))
      )
  );

  const animeRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('spawnboss_anime')
      .setPlaceholder('Select anime')
      .setDisabled(disabled)
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        ANIME_OPTIONS.map((opt) => ({
          label: opt.label,
          value: opt.value,
          default: state.anime === opt.value
        }))
      )
  );

  const bossOptions = filtered.slice(0, 25).map((boss) => ({
    label: boss.display_name.slice(0, 100),
    value: boss.boss_key,
    default: boss.boss_key === state.bossKey
  }));

  const bossRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('spawnboss_boss')
      .setPlaceholder('Select boss')
      .setDisabled(disabled || !bossOptions.length)
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(bossOptions.length ? bossOptions : [{ label: 'No bosses available', value: 'none', default: true }])
  );

  const spawnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('spawnboss_spawn')
      .setLabel('Spawn Boss')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled || !state.bossKey)
  );

  const embed = new EmbedBuilder()
    .setColor('#0f172a')
    .setTitle('SOULFALRES Boss Spawner')
    .setDescription(
      selected
        ? `Type: **${state.type.toUpperCase()}**\nAnime: **${animes[state.anime]?.label || state.anime}**\nBoss: **${selected.display_name}**`
        : 'No boss available for this selection.'
    )
    .setFooter({ text: 'Choose type, anime, boss, then press Spawn Boss' });

  return { embeds: [embed], components: [typeRow, animeRow, bossRow, spawnRow] };
}

async function execute(interaction, ctx) {
  try {
    const { isOwner, isAdmin } = isOwnerOrAdmin(interaction, ctx.env);
    if (!isOwner && !isAdmin) {
      return replyError(
        interaction,
        `Owner/Admin check failed. Your ID: ${interaction.user.id} | Required owner: 795466540140986368`
      );
    }

    await interaction.deferReply();

    const catalog = await ctx.bossService.listBossCatalog();
    if (!catalog.length) {
      return replyError(interaction, 'No bosses found in database. Seed bosses first.');
    }

    const state = { type: 'normal', anime: 'onepiece', bossKey: null };
    normalizeState(state, catalog);

    await interaction.editReply(buildView(state, catalog));

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 10 * 60 * 1000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: 'Only the command user can use this menu.', flags: MessageFlags.Ephemeral });
        return;
      }

      try {
        if (i.customId === 'spawnboss_type') {
          state.type = i.values[0];
          normalizeState(state, catalog);
          await i.update(buildView(state, catalog));
          return;
        }

        if (i.customId === 'spawnboss_anime') {
          state.anime = i.values[0];
          normalizeState(state, catalog);
          await i.update(buildView(state, catalog));
          return;
        }

        if (i.customId === 'spawnboss_boss') {
          const picked = i.values[0];
          if (picked !== 'none') state.bossKey = picked;
          normalizeState(state, catalog);
          await i.update(buildView(state, catalog));
          return;
        }

        if (i.customId === 'spawnboss_spawn') {
          const filtered = normalizeState(state, catalog);
          const selected = filtered.find((x) => x.boss_key === state.bossKey);
          if (!selected) {
            await i.reply({ content: 'Pick a valid boss first.', flags: MessageFlags.Ephemeral });
            return;
          }

          await i.deferUpdate();
          const result = await ctx.bossService.spawnSpecificBoss(state.bossKey);
          const { activeBoss, spawnPng } = result;

          const doneView = buildView(state, catalog, true);
          const successEmbed = new EmbedBuilder()
            .setColor('#16a34a')
            .setTitle('Boss Spawned')
            .setDescription(
              `Type: **${state.type.toUpperCase()}**\nAnime: **${animes[state.anime]?.label || state.anime}**\nBoss: **${selected.display_name}**\nHP: **${activeBoss.hp_current}/${activeBoss.hp_max}**`
            );

          if (spawnPng) {
            const file = new AttachmentBuilder(spawnPng, { name: `boss_spawn_${activeBoss.boss_key}.png` });
            await interaction.editReply({ embeds: [successEmbed], components: doneView.components, files: [file] });
          } else {
            await interaction.editReply({ embeds: [successEmbed], components: doneView.components, files: [] });
          }

          collector.stop('spawned');
        }
      } catch (err) {
        await replyError(i, err.message || 'Boss spawn interaction failed');
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'spawned') return;
      try {
        await interaction.editReply(buildView(state, catalog, true));
      } catch {
        // Message could be gone; ignore cleanup error.
      }
    });
  } catch (error) {
    return replyError(interaction, error.message || 'spawnboss failed');
  }
}

module.exports = { data, execute };