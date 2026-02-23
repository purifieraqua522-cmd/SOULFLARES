const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildBossSpawnPayload(activeBoss, spawnPng) {
  const rarity = activeBoss.is_secret ? 'SECRET' : activeBoss.is_super ? 'SUPER' : 'NORMAL';
  const rarityEmoji = activeBoss.is_secret ? '👻' : activeBoss.is_super ? '🔮' : '⚡';
  const files = [];
  if (spawnPng) {
    const attachment = new AttachmentBuilder(spawnPng, { name: `boss_spawn_${activeBoss.id}.png` });
    files.push(attachment);
  }

  const joinButton = new ButtonBuilder().setCustomId(`boss_join:${activeBoss.id}`).setLabel('Join').setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder().addComponents(joinButton);

  if (!files.length) {
    return {
      content: `${rarityEmoji} ${rarity} Boss spawned: ${activeBoss.display_name || activeBoss.boss_key} (PNG generation failed)`,
      files,
      components: [row]
    };
  }

  return { content: `${rarityEmoji} **${rarity}** Boss: **${activeBoss.display_name || activeBoss.boss_key}**`, files, components: [row], embeds: [] };
}

module.exports = { buildBossSpawnPayload };
