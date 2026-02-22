const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder()
  .setName('raid')
  .setDescription('Raid system')
  .addSubcommand((s) =>
    s
      .setName('start')
      .setDescription('Start a raid')
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
      .addStringOption((o) =>
        o
          .setName('difficulty')
          .setDescription('Raid difficulty')
          .setRequired(true)
          .addChoices({ name: 'Easy', value: 'easy' }, { name: 'Hard', value: 'hard' }, { name: 'Nightmare', value: 'nightmare' })
      )
  )
  .addSubcommand((s) =>
    s
      .setName('join')
      .setDescription('Join raid lobby')
      .addStringOption((o) => o.setName('raid_id').setDescription('Raid ID').setRequired(true))
  );

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  try {
    if (sub === 'start') {
      const anime = interaction.options.getString('anime', true);
      const difficulty = interaction.options.getString('difficulty', true);
      const raid = await ctx.raidService.startRaid(userId, anime, difficulty);
      return replySuccess(interaction, 'Raid Created', [
        `Raid ID: \`${raid.id}\``,
        `Anime: **${raid.anime}**`,
        `Difficulty: **${raid.difficulty}**`,
        `Status: **${raid.state}**`
      ]);
    }

    if (sub === 'join') {
      const raidId = interaction.options.getString('raid_id', true);
      const raid = await ctx.raidService.joinRaid(userId, raidId);
      return replySuccess(interaction, 'Raid Joined', [
        `Raid ID: \`${raid.id}\``,
        `Members: **${raid.members.length}**`,
        `Status: **${raid.state}**`
      ]);
    }
  } catch (error) {
    return replyError(interaction, error.message || 'Raid command failed');
  }
}

module.exports = { data, execute };
