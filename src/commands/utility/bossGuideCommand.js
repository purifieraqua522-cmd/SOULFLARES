const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('bossguide').setDescription('Boss guide');

async function execute(interaction) {
  return replySuccess(interaction, 'Boss Guide', [
    '- Normal boss spawn: every full hour',
    '- Super boss spawn: every 2 hours',
    '- Difficulty: Easy / Hard / Nightmare',
    '- Boss start requires at least 3 players'
  ]);
}

module.exports = { data, execute };
