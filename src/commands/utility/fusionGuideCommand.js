const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('fusion').setDescription('Fusion info').addSubcommand((s) => s.setName('guide').setDescription('Show fusion guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Fusion Guide', [
    '- Nur max-evolved Karten können fusioniert werden',
    '- Rezepte sind fest definiert',
    '- Einige Fusions benötigen seltene Materialien (z.B. demon_finger)'
  ]);
}

module.exports = { data, execute };
