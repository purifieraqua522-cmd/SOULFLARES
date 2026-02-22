const dotenv = require('dotenv');
dotenv.config();

const { loadEnv } = require('../core/env');
const { createDb } = require('../core/db');
const { createRepositories } = require('../data/repositories');
const { createAssetsService } = require('../services/assetsService');

async function run() {
  const env = loadEnv();
  const db = createDb(env);
  const repos = createRepositories(db);
  const assetsService = createAssetsService(repos);
  const result = await assetsService.syncCardsFromAssets();
  console.log(`Assets synced. scanned=${result.scanned} upserted=${result.upserted}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
