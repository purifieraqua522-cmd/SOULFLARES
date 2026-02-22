const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const { loadEnv } = require('../core/env');
const { commandModules } = require('../commands');

async function run() {
  const env = loadEnv();
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const payload = commandModules.map((mod) => mod.data.toJSON());

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), { body: payload });
    console.log(`Deployed ${payload.length} guild commands.`);
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: payload });
    console.log(`Deployed ${payload.length} global commands.`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
