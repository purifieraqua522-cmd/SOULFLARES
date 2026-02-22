const {
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder
} = require('discord.js');

function supportsV2() {
  return typeof ContainerBuilder === 'function' && typeof TextDisplayBuilder === 'function';
}

async function replyError(interaction, message) {
  if (supportsV2()) {
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## SOULFALRES Error'),
        new TextDisplayBuilder().setContent(`- ${message}`)
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1));

    return interaction.reply({
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      components: [container]
    });
  }

  const embed = new EmbedBuilder().setColor('#ff4d4f').setTitle('SOULFALRES Error').setDescription(message);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('err_ack').setLabel('Verstanden').setStyle(ButtonStyle.Secondary).setDisabled(true)
  );
  return interaction.reply({ ephemeral: true, embeds: [embed], components: [row] });
}

async function replySuccess(interaction, title, lines) {
  const content = Array.isArray(lines) ? lines.join('\n') : String(lines);

  if (supportsV2()) {
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${title}`),
      new TextDisplayBuilder().setContent(content)
    );

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] });
    }
    return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
  }

  const embed = new EmbedBuilder().setColor('#22c55e').setTitle(title).setDescription(content);
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }
  return interaction.reply({ embeds: [embed] });
}

module.exports = { replyError, replySuccess, supportsV2 };
