const dotenv = require('dotenv');
dotenv.config();

const { loadEnv } = require('../core/env');
const { createDb } = require('../core/db');
const { cards, materials, bosses, fusions, storeItems } = require('../data/seedData');

async function run() {
  const env = loadEnv();
  const db = createDb(env);

  const upserts = [
    db.from('cards').upsert(cards, { onConflict: 'key' }),
    db.from('materials').upsert(materials, { onConflict: 'material_key' }),
    db.from('bosses').upsert(bosses, { onConflict: 'boss_key' }),
    db.from('fusions').upsert(fusions, { onConflict: 'fusion_key' }),
    db.from('store_items').upsert(storeItems, { onConflict: 'item_key' })
  ];

  for (const task of upserts) {
    const { error } = await task;
    if (error) throw error;
  }

  console.log('Seed complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
