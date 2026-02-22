const { PermissionFlagsBits } = require('discord.js');

const HARD_OWNER_ID = '795466540140986368';

function buildOwnerSet(env) {
  return new Set(
    [HARD_OWNER_ID, env.BOT_OWNER_ID, ...(env.BOT_OWNER_IDS || '').split(',').map((x) => x.trim())].filter(Boolean)
  );
}

function isOwnerOrAdmin(interaction, env) {
  const ownerIds = buildOwnerSet(env);
  const isOwner = ownerIds.has(String(interaction.user?.id || ''));
  const isAdmin = Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
  return { isOwner, isAdmin, ownerIds };
}

module.exports = { HARD_OWNER_ID, buildOwnerSet, isOwnerOrAdmin };
