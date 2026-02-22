const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  EmbedBuilder
} = require('discord.js');
const { replyError } = require('../../ui/responders');

const E = {
  store: '<:store:1475231370518466763>',
  chakra: '<:chakra:1475231026279350422>',
  berries: '<:berries:1475230822754811968>',
  reiryoku: '<:reiryoku:1475230771177324677>',
  cursed: '<:cursed_energy:1475230701489225910>',
  onepiece: { id: '1475231200036786257', name: 'onepiece' },
  naruto: { id: '1475231141677109259', name: 'naruto' },
  bleach: { id: '1475231083670016160', name: 'bleach' },
  jjk: { id: '1475230934855979019', name: 'jjk' },
  global: { id: '1475230882607398992', name: 'global' },
  ok: '<:ok:1475231273047031889>'
};

const ANIME_OPTIONS = [
  { label: 'One Piece', value: 'onepiece', emoji: E.onepiece },
  { label: 'Naruto', value: 'naruto', emoji: E.naruto },
  { label: 'Bleach', value: 'bleach', emoji: E.bleach },
  { label: 'JJK', value: 'jjk', emoji: E.jjk },
  { label: 'Global', value: 'global', emoji: E.global }
];

const CURRENCY_EMOJI = {
  berries: E.berries,
  chakra: E.chakra,
  reiryoku: E.reiryoku,
  cursed_energy: E.cursed
};

const data = new SlashCommandBuilder()
  .setName('store')
  .setDescription('SOULFLARES interactive store (v2 components)');

function supportsV2() {
  return typeof ContainerBuilder === 'function' && typeof TextDisplayBuilder === 'function';
}

function chunkForPage(items, page, perPage) {
  const start = page * perPage;
  return items.slice(start, start + perPage);
}

function buildStoreRows({ selectedAnime, selectedItemKey, pageItems, currentPage, totalPages }) {
  const animeSelect = new StringSelectMenuBuilder()
    .setCustomId('store_anime')
    .setPlaceholder('Select anime category')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      ANIME_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
        emoji: opt.emoji,
        default: selectedAnime === opt.value
      }))
    );

  const itemOptions = pageItems.length
    ? pageItems.map((item) => ({
        label: item.display_name.slice(0, 100),
        value: item.item_key,
        description: `${item.price_amount} ${item.price_currency}`.slice(0, 100),
        default: selectedItemKey === item.item_key
      }))
    : [{ label: 'No items available', value: 'none', description: 'Change category', default: true }];

  const itemSelect = new StringSelectMenuBuilder()
    .setCustomId('store_item')
    .setPlaceholder('Select item')
    .setMinValues(1)
    .setMaxValues(1)
    .setDisabled(!pageItems.length)
    .addOptions(itemOptions);

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('store_prev').setLabel('Prev').setStyle(ButtonStyle.Secondary).setDisabled(currentPage <= 0),
    new ButtonBuilder().setCustomId('store_next').setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= totalPages - 1),
    new ButtonBuilder().setCustomId('store_buy').setLabel('Buy').setStyle(ButtonStyle.Success).setDisabled(!selectedItemKey)
  );

  return {
    animeRow: new ActionRowBuilder().addComponents(animeSelect),
    itemRow: new ActionRowBuilder().addComponents(itemSelect),
    navRow
  };
}

function buildV2Payload(state) {
  const { selectedAnime, pageItems, currentPage, totalPages, selectedItemKey } = state;
  const rows = buildStoreRows(state);

  const lines = pageItems.length
    ? pageItems.map((item, idx) => {
        const num = currentPage * 5 + idx + 1;
        const emoji = CURRENCY_EMOJI[item.price_currency] || '💰';
        const marker = selectedItemKey === item.item_key ? `${E.ok} ` : '';
        return `${marker}${num}. **${item.display_name}** - ${item.price_amount} ${emoji} (${item.price_currency})`;
      })
    : ['No items available in this category.'];

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${E.store} SOULFLARES Store`),
      new TextDisplayBuilder().setContent(`Category: **${selectedAnime.toUpperCase()}** | Page **${currentPage + 1}/${totalPages}**`),
      new TextDisplayBuilder().setContent(lines.join('\n'))
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(rows.animeRow)
    .addActionRowComponents(rows.itemRow)
    .addActionRowComponents(rows.navRow);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
    embeds: [],
    content: ''
  };
}

function buildFallbackPayload(state) {
  const { selectedAnime, pageItems, currentPage, totalPages, selectedItemKey } = state;
  const rows = buildStoreRows(state);

  const embed = new EmbedBuilder()
    .setColor('#1e293b')
    .setTitle(`${E.store} SOULFLARES Store`)
    .setDescription(`Category: ${selectedAnime.toUpperCase()} | Page ${currentPage + 1}/${totalPages}`)
    .setFooter({ text: '2 select menus + Prev/Next/Buy' });

  if (pageItems.length) {
    pageItems.forEach((item, idx) => {
      const num = currentPage * 5 + idx + 1;
      const selected = selectedItemKey === item.item_key ? `${E.ok} ` : '';
      embed.addFields({
        name: `${selected}${num}. ${item.display_name}`,
        value: `${item.price_amount} ${item.price_currency} | key: ${item.item_key}`,
        inline: false
      });
    });
  } else {
    embed.addFields({ name: 'No items', value: 'Switch category.' });
  }

  return {
    embeds: [embed],
    components: [rows.animeRow, rows.itemRow, rows.navRow],
    content: ''
  };
}

function buildPayload(state) {
  return supportsV2() ? buildV2Payload(state) : buildFallbackPayload(state);
}

async function execute(interaction, ctx) {
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    const allItems = await ctx.storeService.list();
    const itemsByAnime = {
      onepiece: allItems.filter((i) => ['onepiece', 'global'].includes(i.anime)),
      naruto: allItems.filter((i) => ['naruto', 'global'].includes(i.anime)),
      bleach: allItems.filter((i) => ['bleach', 'global'].includes(i.anime)),
      jjk: allItems.filter((i) => ['jjk', 'global'].includes(i.anime)),
      global: allItems.filter((i) => i.anime === 'global')
    };

    const state = {
      selectedAnime: 'onepiece',
      currentPage: 0,
      totalPages: 1,
      pageItems: [],
      selectedItemKey: null
    };

    function refreshState() {
      const list = itemsByAnime[state.selectedAnime] || [];
      state.totalPages = Math.max(1, Math.ceil(list.length / 5));
      if (state.currentPage >= state.totalPages) state.currentPage = state.totalPages - 1;
      state.pageItems = chunkForPage(list, state.currentPage, 5);
      if (!state.pageItems.find((x) => x.item_key === state.selectedItemKey)) {
        state.selectedItemKey = state.pageItems[0]?.item_key || null;
      }
    }

    refreshState();

    await interaction.editReply(buildPayload(state));
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({ time: 10 * 60 * 1000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Only the command user can use this menu.', flags: MessageFlags.Ephemeral });
      }

      try {
        if (i.customId === 'store_anime') {
          await i.deferUpdate();
          state.selectedAnime = i.values[0];
          state.currentPage = 0;
          refreshState();
          await interaction.editReply(buildPayload(state));
          return;
        }

        if (i.customId === 'store_item') {
          await i.deferUpdate();
          const next = i.values[0];
          if (next !== 'none') state.selectedItemKey = next;
          refreshState();
          await interaction.editReply(buildPayload(state));
          return;
        }

        if (i.customId === 'store_prev') {
          await i.deferUpdate();
          if (state.currentPage > 0) state.currentPage -= 1;
          refreshState();
          await interaction.editReply(buildPayload(state));
          return;
        }

        if (i.customId === 'store_next') {
          await i.deferUpdate();
          if (state.currentPage < state.totalPages - 1) state.currentPage += 1;
          refreshState();
          await interaction.editReply(buildPayload(state));
          return;
        }

        if (i.customId === 'store_buy') {
          if (!state.selectedItemKey) {
            await i.reply({ content: 'Select an item first.', flags: MessageFlags.Ephemeral });
            return;
          }

          await i.deferReply({ flags: MessageFlags.Ephemeral });
          const result = await ctx.storeService.buy(i.user.id, state.selectedItemKey);
          const balance = result.wallet?.[result.item.price_currency] ?? 0;

          await i.editReply({
            content: `${E.ok} Bought **${result.item.display_name}** | Effect: ${result.effect} | Balance: ${balance} ${result.item.price_currency}`
          });

          const all = await ctx.storeService.list();
          itemsByAnime.onepiece = all.filter((x) => ['onepiece', 'global'].includes(x.anime));
          itemsByAnime.naruto = all.filter((x) => ['naruto', 'global'].includes(x.anime));
          itemsByAnime.bleach = all.filter((x) => ['bleach', 'global'].includes(x.anime));
          itemsByAnime.jjk = all.filter((x) => ['jjk', 'global'].includes(x.anime));
          itemsByAnime.global = all.filter((x) => x.anime === 'global');

          refreshState();
          await interaction.editReply(buildPayload(state));
        }
      } catch (err) {
        if (!i.replied && !i.deferred) {
          await i.reply({ content: `❌ ${err.message || 'Store interaction failed.'}`, flags: MessageFlags.Ephemeral });
        }
      }
    });

    collector.on('end', async () => {
      try {
        const disabledRows = buildStoreRows(state);
        disabledRows.animeRow.components[0].setDisabled(true);
        disabledRows.itemRow.components[0].setDisabled(true);
        disabledRows.navRow.components.forEach((btn) => btn.setDisabled(true));

        if (supportsV2()) {
          const container = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## ${E.store} SOULFLARES Store`),
              new TextDisplayBuilder().setContent('Store session expired. Run `/store` again.')
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
            .addActionRowComponents(disabledRows.animeRow)
            .addActionRowComponents(disabledRows.itemRow)
            .addActionRowComponents(disabledRows.navRow);
          await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container], embeds: [], content: '' });
        } else {
          await interaction.editReply({ components: [disabledRows.animeRow, disabledRows.itemRow, disabledRows.navRow] });
        }
      } catch {
        // Ignore cleanup errors.
      }
    });
  } catch (error) {
    return replyError(interaction, error.message || 'Store failed');
  }
}

module.exports = { data, execute };
