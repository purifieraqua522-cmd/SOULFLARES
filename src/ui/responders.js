const { EmbedBuilder } = require('discord.js');

async function replyError(interaction, message) {
  const embed = new EmbedBuilder().setColor('#ef4444').setTitle('SOULFALRES Error').setDescription(message);
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }
  return interaction.reply({ ephemeral: true, embeds: [embed] });
}

async function replySuccess(interaction, title, lines) {
  const content = Array.isArray(lines) ? lines.join('\n') : String(lines);
  const embed = new EmbedBuilder().setColor('#22c55e').setTitle(title).setDescription(content);
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }
  return interaction.reply({ embeds: [embed] });
}

module.exports = { replyError, replySuccess };
