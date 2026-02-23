const path = require('path');
const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');
const { raidPresets } = require('../../data/constants');

function resolveRaidImagePath(anime, raidKey) {
  const root = path.resolve(process.cwd(), 'assets/backgrounds/raid');
  const candidates = [
    path.join(root, `${raidKey}.png`),
    path.join(root, `${anime}_${raidKey}.png`),
    path.join(root, `${anime}.png`),
    path.join(root, 'default.png')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

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
      .addStringOption((o) => o.setName('raid_key').setDescription('Choose raid preset').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand((s) =>
    s
      .setName('join')
      .setDescription('Join raid lobby')
      .addStringOption((o) => o.setName('raid').setDescription('Choose raid (optional)').setRequired(false).setAutocomplete(true))
  );

async function execute(interaction, ctx) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  try {
    if (sub === 'start') {
      const anime = interaction.options.getString('anime', true);
      const raidKey = interaction.options.getString('raid_key', true);
      const { raid, preset } = await ctx.raidService.startRaid(userId, anime, raidKey);
      const lines = [
        `Raid ID: \`${raid.id}\``,
        `Anime: **${raid.anime.toUpperCase()}**`,
        `Raid: **${preset.label}**`,
        `Fixed Power: **${preset.fixedPower}**`,
        `Stages: **${preset.stages.join(' -> ')}**`,
        `Status: **${raid.state}**`
      ];

      const raidImagePath = resolveRaidImagePath(anime, raidKey);
      if (!raidImagePath) {
        return replySuccess(interaction, 'Raid Created', lines);
      }

      const file = new AttachmentBuilder(raidImagePath, { name: `${raidKey}.png` });
      return interaction.reply({ content: lines.join('\n'), files: [file] });
    }

    if (sub === 'join') {
      const selected = interaction.options.getString('raid');
      const raids = await ctx.repos.getJoinableRaids();
      if (!raids.length) return replyError(interaction, 'No joinable raids found.');
      const raidId = selected ? (raids.find((r) => r.id === selected)?.id || null) : raids[0].id;
      if (!raidId) return replyError(interaction, 'Selected raid not found.');
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

async function autocomplete(interaction, ctx) {
  try {
    const focused = interaction.options.getFocused(true);
    const query = String(focused.value || '').toLowerCase();

    if (focused.name === 'raid_key') {
      const anime = interaction.options.getString('anime');
      const list = Object.values(raidPresets).filter((preset) => (!anime || preset.anime === anime));
      const choices = list
        .filter((preset) => {
          const label = `${preset.key} ${preset.label} ${preset.anime}`.toLowerCase();
          return !query || label.includes(query);
        })
        .slice(0, 25)
        .map((preset) => ({
          name: `${preset.label} | power ${preset.fixedPower}`,
          value: preset.key
        }));
      return interaction.respond(choices);
    }

    if (focused.name === 'raid') {
      const raids = await ctx.repos.getJoinableRaids();
      const choices = raids
        .filter((r) => {
          const label = `${r.id} ${r.anime} ${r.difficulty} ${r.state}`.toLowerCase();
          return !query || label.includes(query);
        })
        .slice(0, 25)
        .map((r) => ({
          name: `${r.anime.toUpperCase()} | ${(r.difficulty || 'fixed').replace('fixed:', '')} | members ${(r.members || []).length} | ${r.state}`,
          value: r.id
        }));

      return interaction.respond(choices);
    }

    return interaction.respond([]);
  } catch {
    return interaction.respond([]);
  }
}

module.exports = { data, execute, autocomplete };
