const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildRaidButtons(raidId, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`raid_team_create:${raidId}`).setLabel('Team Create').setStyle(ButtonStyle.Success).setDisabled(disabled),
    new ButtonBuilder().setCustomId(`raid_team_join:${raidId}`).setLabel('Join Team').setStyle(ButtonStyle.Primary).setDisabled(disabled),
    new ButtonBuilder().setCustomId(`raid_attack:${raidId}`).setLabel('Attack Raid').setStyle(ButtonStyle.Danger).setDisabled(disabled),
    new ButtonBuilder().setCustomId(`raid_status:${raidId}`).setLabel('Status').setStyle(ButtonStyle.Secondary).setDisabled(false)
  );
}

function buildRaidPayload({ raid, raidPng, title, statusText, disabled = false }) {
  const files = [];
  if (raidPng) {
    files.push(new AttachmentBuilder(raidPng, { name: `raid_${raid.id}.png` }));
  }
  const row = buildRaidButtons(raid.id, disabled);
  const content = `${title}\n${statusText || ''}`.trim();

  if (!files.length) return { content, components: [row] };
  return { content, files, components: [row], embeds: [] };
}

module.exports = { buildRaidPayload };
