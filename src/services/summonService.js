const { animes, rarities, secretCards } = require('../data/constants');

function weightedPick(options) {
  const total = options.reduce((acc, x) => acc + x.weight, 0);
  let roll = Math.random() * total;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option.value;
  }
  return options[options.length - 1].value;
}

function createSummonService(repos) {
  return {
    async summon(userId, anime) {
      const animeCfg = animes[anime];
      if (!animeCfg) throw new Error('Invalid anime');

      const currency = animeCfg.currency;
      const packCost = 100;
      await repos.spendCurrency(userId, currency, packCost);

      const pool = await repos.getCardsByAnime(anime);
      const rarity = weightedPick([
        { value: 'epic', weight: rarities.epic.weight },
        { value: 'legendary', weight: rarities.legendary.weight },
        { value: 'mythical', weight: rarities.mythical.weight },
        { value: 'secret', weight: rarities.secret.weight }
      ]);

      let card;
      if (rarity === 'secret') {
        const availableSecrets = await Promise.all(secretCards.map((key) => repos.getCardByKey(key)));
        const clean = availableSecrets.filter(Boolean);
        card = clean[Math.floor(Math.random() * clean.length)];
      } else {
        const byRarity = pool.filter((x) => x.rarity === rarity);
        const targetPool = byRarity.length ? byRarity : pool.filter((x) => x.rarity === 'epic');
        card = targetPool[Math.floor(Math.random() * targetPool.length)];
      }

      await repos.upsertUserCard(userId, card.key, { copies: 1 });
      return { card, rarity, cost: packCost, currency };
    }
  };
}

module.exports = { createSummonService };
