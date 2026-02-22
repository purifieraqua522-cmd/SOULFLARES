const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildParticipantText(participants = []) {
  if (!participants.length) return '0 players';
  const mentions = participants.slice(0, 10).map((id) => `<@${id}>`);
  const more = participants.length > 10 ? ` +${participants.length - 10} more` : '';
  return `${participants.length} players\n${mentions.join(', ')}${more}`;
}

function buildBossSpawnPayload(activeBoss, spawnPng) {
  const participants = Array.isArray(activeBoss.participants) ? activeBoss.participants : [];
  const embed = new EmbedBuilder()
    .setTitle('⚔️ BOSS SPAWNED')
    .setDescription(`A wild **${activeBoss.display_name || activeBoss.boss_key}** has appeared!`)
    .addFields(
      { name: 'Anime', value: String(activeBoss.anime || '').toUpperCase() || 'UNKNOWN', inline: true },
      { name: 'Type', value: activeBoss.is_super ? '⭐ SUPER' : activeBoss.is_event ? '🔥 EVENT' : 'Normal', inline: true },
      { name: 'HP', value: `${activeBoss.hp_current}/${activeBoss.hp_max}`, inline: true },
      { name: 'Difficulty', value: String(activeBoss.difficulty || 'easy').toUpperCase(), inline: true },
      { name: 'Status', value: String(activeBoss.state || 'open').toUpperCase(), inline: true },
      { name: 'Participants', value: buildParticipantText(participants), inline: false }
    )
    .setColor('#0ea5e9')
    .setTimestamp();

  const files = [];
  if (spawnPng) {
    const attachment = new AttachmentBuilder(spawnPng, { name: `boss_spawn_${activeBoss.id}.png` });
    files.push(attachment);
    embed.setImage(`attachment://boss_spawn_${activeBoss.id}.png`);
  }

  const joinButton = new ButtonBuilder().setCustomId(`boss_join:${activeBoss.id}`).setLabel('Join').setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder().addComponents(joinButton);

  return { embeds: [embed], files, components: [row] };
}

module.exports = { buildBossSpawnPayload };
