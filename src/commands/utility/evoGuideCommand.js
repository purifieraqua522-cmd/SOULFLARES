const { SlashCommandBuilder } = require('discord.js');
const { replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('evo').setDescription('Evolution info').addSubcommand((s) => s.setName('guide').setDescription('Show evolution guide'));

async function execute(interaction) {
  return replySuccess(interaction, 'Evolution Guide', [
    '- Tier structure: Epic -> Legendary -> Mythical',
    '- Each evolution needs currency + materials',
    '- Merge is only available at max evolution'
  ]);
}

module.exports = { data, execute };
