const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('spawnboss')
  .setDescription('Owner: force spawn boss')
  .addStringOption((o) =>
    o
      .setName('anime')
      .setDescription('Anime')
      .setRequired(true)
      .addChoices(
        { name: 'One Piece', value: 'onepiece' },
        { name: 'Naruto', value: 'naruto' },
        { name: 'Bleach', value: 'bleach' },
        { name: 'JJK', value: 'jjk' }
      )
  )
  .addBooleanOption((o) => o.setName('super').setDescription('Spawn super boss').setRequired(true));

async function execute(interaction, ctx) {
  try {
    if (interaction.user.id !== ctx.env.BOT_OWNER_ID) {
      return replyError(interaction, 'Only the bot owner can use this command.');
    }

    const anime = interaction.options.getString('anime', true);
    const isSuper = interaction.options.getBoolean('super', true);
    const boss = await ctx.bossService.spawnScheduledBoss({ anime, isSuper });

    return replySuccess(interaction, 'Boss Spawned', [`ID: \`${boss.id}\``, `Boss Key: **${boss.boss_key}**`]);
  } catch (error) {
    return replyError(interaction, error.message || 'spawnboss failed');
  }
}

module.exports = { data, execute };
