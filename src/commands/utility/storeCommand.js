const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const { replyError } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('store')
  .setDescription('🛍️ Browse and buy items from the SOULFLARES store');

async function execute(interaction, ctx) {
  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor('#1e293b')
      .setTitle('⚔️ SOULFLARES STORE')
      .setDescription('📦 Loading items...');

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [loadingEmbed], components: [] });
    } else {
      await interaction.reply({ embeds: [loadingEmbed] });
    }

    const allItems = await ctx.storeService.list();
    const itemsByAnime = {
      onepiece: allItems.filter((i) => ['onepiece', 'global'].includes(i.anime)),
      naruto: allItems.filter((i) => ['naruto', 'global'].includes(i.anime)),
      bleach: allItems.filter((i) => ['bleach', 'global'].includes(i.anime)),
      jjk: allItems.filter((i) => ['jjk', 'global'].includes(i.anime)) || [],
      global: allItems.filter((i) => i.anime === 'global')
    };

    let selectedAnime = 'onepiece';
    let currentPage = 0;

    const recreateMessage = async () => {
      const items = itemsByAnime[selectedAnime] || [];
      const itemsPerPage = 5;
      const pages = Math.max(1, Math.ceil(items.length / itemsPerPage));
      const pageItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

      const embed = new EmbedBuilder()
        .setColor('#1e293b')
        .setTitle('⚔️ SOULFLARES STORE')
        .setDescription(`Browse items for **${selectedAnime.toUpperCase()}**`)
        .setFooter({ text: `Page ${currentPage + 1}/${pages} • Select items to purchase` });

      if (pageItems.length === 0) {
        embed.addFields({ name: 'No items available', value: 'Check back later for more items!' });
      } else {
        pageItems.forEach((item, idx) => {
          const itemNum = currentPage * itemsPerPage + idx + 1;
          const currencyEmoji = {
            berries: '🍖',
            chakra: '⚡',
            reiryoku: '👻',
            cursed_energy: '🔮'
          }[item.price_currency] || '💰';

          embed.addFields({
            name: `${itemNum}. ${item.display_name}`,
            value: `Price: **${item.price_amount}** ${currencyEmoji}\nKey: \`${item.item_key}\``,
            inline: false
          });
        });
      }

      const animeSelect = new StringSelectMenuBuilder()
        .setCustomId('store_anime_select')
        .setPlaceholder('Choose an anime')
        .addOptions([
          { label: '🏴‍☠️ One Piece', value: 'onepiece', default: selectedAnime === 'onepiece' },
          { label: '🍂 Naruto', value: 'naruto', default: selectedAnime === 'naruto' },
          { label: '⚪ Bleach', value: 'bleach', default: selectedAnime === 'bleach' },
          { label: '🖤 JJK', value: 'jjk', default: selectedAnime === 'jjk' },
          { label: '🌍 Global', value: 'global', default: selectedAnime === 'global' }
        ]);

      let itemSelect = null;
      const itemOptions = pageItems.map((item) => ({
        label: item.display_name.substring(0, 100),
        description: `${item.price_amount} ${item.price_currency}`,
        value: item.item_key,
        emoji: {
          xp: '⭐',
          material: '📦',
          ticket: '🎟️',
          currency: '💰'
        }[item.item_type]
      }));

      if (itemOptions.length > 0) {
        itemSelect = new StringSelectMenuBuilder()
          .setCustomId('store_item_select')
          .setPlaceholder('Select an item to buy')
          .addOptions(itemOptions);
      }

      const navButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('store_prev')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('store_next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage >= pages - 1),
        new ButtonBuilder().setCustomId('store_close').setLabel('Close').setStyle(ButtonStyle.Danger)
      );

      const components = [new ActionRowBuilder().addComponents(animeSelect)];
      if (itemSelect) components.push(new ActionRowBuilder().addComponents(itemSelect));
      components.push(navButtons);

      return { embeds: [embed], components };
    };

    const message = await interaction.editReply(await recreateMessage());

    const collector = message.createMessageComponentCollector({ time: 10 * 60 * 1000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'You cannot interact with this menu.', flags: MessageFlags.Ephemeral });
      }

      if (i.customId === 'store_anime_select') {
        selectedAnime = i.values[0];
        currentPage = 0;
        await i.deferUpdate();
        await message.edit(await recreateMessage());
        return;
      }

      if (i.customId === 'store_item_select') {
        const itemKey = i.values[0];
        await i.deferReply({ flags: MessageFlags.Ephemeral });
        try {
          const result = await ctx.storeService.buy(i.user.id, itemKey);
          const balance = result.wallet?.[result.item.price_currency] ?? 0;

          const successEmbed = new EmbedBuilder()
            .setColor('#22c55e')
            .setTitle('✅ Purchase Successful!')
            .setDescription(`**${result.item.display_name}**`)
            .addFields([
              { name: 'Price Paid', value: `${result.item.price_amount} ${result.item.price_currency}`, inline: true },
              { name: 'Effect', value: result.effect, inline: true },
              { name: 'Balance', value: `${balance} ${result.item.price_currency}`, inline: true }
            ])
            .setTimestamp();

          await i.editReply({ embeds: [successEmbed] });
          await message.edit(await recreateMessage());
        } catch (error) {
          await i.editReply({ content: `❌ Error: ${error.message}` });
        }
        return;
      }

      if (i.customId === 'store_prev') {
        if (currentPage > 0) currentPage--;
        await i.deferUpdate();
        await message.edit(await recreateMessage());
        return;
      }

      if (i.customId === 'store_next') {
        const itemsPerPage = 5;
        const pages = Math.max(1, Math.ceil((itemsByAnime[selectedAnime] || []).length / itemsPerPage));
        if (currentPage < pages - 1) currentPage++;
        await i.deferUpdate();
        await message.edit(await recreateMessage());
        return;
      }

      if (i.customId === 'store_close') {
        await i.deferUpdate();
        collector.stop();
        await message.edit({ content: '👋 Store closed.', embeds: [], components: [] });
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch {
        // Message already gone.
      }
    });
  } catch (error) {
    return replyError(interaction, error.message || 'Store failed');
  }
}

module.exports = { data, execute };
