const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('evo').setDescription('Evolution info').addSubcommand((s) => s.setName('guide').setDescription('Show evolution guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Evolution Guide', [
    '- Tier Struktur: Epic -> Legendary -> Mythical',
    '- Für jede Evolution brauchst du Währung + Material',
    '- Merge ist erst bei max Evolution möglich'
  ]);
}

module.exports = { data, execute };
