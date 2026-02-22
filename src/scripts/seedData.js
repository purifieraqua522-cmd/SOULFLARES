const dotenv = require('dotenv');
dotenv.config();

const { loadEnv } = require('../core/env');
const { createDb } = require('../core/db');
const { cards, materials, bosses, fusions, storeItems } = require('../data/seedData');
const { createRepositories } = require('../data/repositories');
const { createAssetsService } = require('../services/assetsService');

async function run() {
  const env = loadEnv();
  const db = createDb(env);
  const repos = createRepositories(db);
  const assetsService = createAssetsService(repos);
  const normalizedCards = cards.map((card) => ({
    secret: false,
    fusion_only: false,
    ...card
  }));

  const upserts = [
    db.from('cards').upsert(normalizedCards, { onConflict: 'key' }),
    db.from('materials').upsert(materials, { onConflict: 'material_key' }),
    db.from('bosses').upsert(bosses, { onConflict: 'boss_key' }),
    db.from('fusions').upsert(fusions, { onConflict: 'fusion_key' }),
    db.from('store_items').upsert(storeItems, { onConflict: 'item_key' })
  ];

  for (const task of upserts) {
    const { error } = await task;
    if (error) throw error;
  }

  await assetsService.syncCardsFromAssets();
  console.log('Seed complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
