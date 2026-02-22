const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('gear').setDescription('Gear help').addSubcommand((s) => s.setName('guide').setDescription('Show gear guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Gear Guide', [
    '- Gear slots: Weapon, Artifact, Relic',
    '- Gear droppt in Bossen und Raids',
    '- Höhere Seltenheit = bessere Stat-Multipliers'
  ]);
}

module.exports = { data, execute };
