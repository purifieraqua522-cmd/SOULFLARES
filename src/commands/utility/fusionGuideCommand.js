const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('fusion').setDescription('Fusion info').addSubcommand((s) => s.setName('guide').setDescription('Show fusion guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Fusion Guide', [
    '- Only max-evolved cards can be fused',
    '- Fusion recipes are fixed',
    '- Some fusions require rare materials (for example: demon_finger)'
  ]);
}

module.exports = { data, execute };
