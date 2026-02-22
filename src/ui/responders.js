const {
  EmbedBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder
} = require('discord.js');

const ERROR_EMOJI_TEXT = '<:XMark:1475084001189429396>';

function supportsV2() {
  return typeof ContainerBuilder === 'function' && typeof TextDisplayBuilder === 'function';
}

function buildErrorV2(message) {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${ERROR_EMOJI_TEXT} SOULFALRES Error`),
      new TextDisplayBuilder().setContent(String(message || 'Unknown error'))
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1));
}

async function replyError(interaction, message) {
  if (supportsV2()) {
    const container = buildErrorV2(message);
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ components: [container], embeds: [], content: '' });
    }
    return interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container]
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#ef4444')
    .setTitle(`${ERROR_EMOJI_TEXT} SOULFALRES Error`)
    .setDescription(String(message || 'Unknown error'));

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }
  return interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
}

async function replySuccess(interaction, title, lines) {
  const content = Array.isArray(lines) ? lines.join('\n') : String(lines);
  const embed = new EmbedBuilder().setColor('#22c55e').setTitle(title).setDescription(content);
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }
  return interaction.reply({ embeds: [embed] });
}

module.exports = { replyError, replySuccess, supportsV2 };
