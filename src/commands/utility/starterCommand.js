const { SlashCommandBuilder } = require('discord.js');
const { replyError, replySuccess } = require('../../ui/responders');

const data = new SlashCommandBuilder().setName('starter').setDescription('Claim your one-time starter pack');

async function execute(interaction, ctx) {
  try {
    const userId = interaction.user.id;
    await ctx.repos.ensureProfile(userId);

    const claimedQty = await ctx.repos.getMaterialQty(userId, 'starter_claimed');
    if (claimedQty > 0) {
      return replyError(interaction, 'Starter pack already claimed.');
    }

    await Promise.all([
      ctx.repos.addCurrency(userId, 'berries', 1500),
      ctx.repos.addCurrency(userId, 'chakra', 1500),
      ctx.repos.addCurrency(userId, 'reiryoku', 1500),
      ctx.repos.addCurrency(userId, 'cursed_energy', 1500),
      ctx.repos.addMaterial(userId, 'raid_ticket', 3),
      ctx.repos.addMaterial(userId, 'op_evo_frag', 2),
      ctx.repos.addMaterial(userId, 'na_evo_seal', 2),
      ctx.repos.addMaterial(userId, 'bl_evo_core', 2),
      ctx.repos.addMaterial(userId, 'jjk_evo_relic', 2),
      ctx.repos.addMaterial(userId, 'starter_claimed', 1)
    ]);

    return replySuccess(interaction, 'Starter Pack Claimed', [
      'Currencies: **+1500** for each anime coin',
      'Materials: **+2** evolution material for each anime',
      'Raid Tickets: **+3**'
    ]);
  } catch (error) {
    return replyError(interaction, error.message || 'starter failed');
  }
}

module.exports = { data, execute };
