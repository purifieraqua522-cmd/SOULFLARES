const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('bossguide').setDescription('Boss guide');

async function execute(interaction) {
  return replySuccess(interaction, 'Boss Guide', [
    '- Normal Boss Spawn: jede volle Stunde',
    '- Super Boss Spawn: alle 2 Stunden',
    '- Difficulty: Easy / Hard / Nightmare',
    '- Start braucht mindestens 3 Spieler'
  ]);
}

module.exports = { data, execute };
