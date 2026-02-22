const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('gear').setDescription('Gear help').addSubcommand((s) => s.setName('guide').setDescription('Show gear guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Gear Guide', [
    '- Gear slots: Weapon, Artifact, Relic',
    '- Gear drops from bosses and raids',
    '- Higher rarity gives stronger stat multipliers'
  ]);
}

module.exports = { data, execute };
