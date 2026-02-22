const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const { loadEnv } = require('../core/env');
const { commandModules } = require('../commands');

async function run() {
  const env = loadEnv();
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const payload = commandModules.map((mod) => mod.data.toJSON());
  console.log(`Deploying ${payload.length} slash commands...`);

  if (env.DISCORD_GUILD_ID) {
    console.log(`Using guild deploy for guild ${env.DISCORD_GUILD_ID}.`);
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), { body: payload });
    console.log(`Deployed ${payload.length} guild commands.`);
  } else {
    console.log('Using global deploy. Discord can take up to 1 hour to show global commands.');
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: payload });
    console.log(`Deployed ${payload.length} global commands.`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
