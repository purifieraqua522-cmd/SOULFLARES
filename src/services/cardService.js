const maxTier = 3;

function createCardService(repos) {
  return {
    async evolve(userId, cardKey) {
      throw new Error('Evolution is disabled. Cards are obtained from boss drops or store.');
    },

    async merge(userId, cardKey) {
      const userCard = await repos.getUserCard(userId, cardKey);
      if (!userCard || userCard.copies < 2) throw new Error('You need duplicate copies to merge');
      const card = await repos.getCardByKey(cardKey);
      if (!card || card.evolution_tier < 3) throw new Error('Card must be max evolved to merge');

      const nextAscension = userCard.ascension + 1;
      await repos.removeUserCardCopy(userId, cardKey, 1);
      await repos.upsertUserCard(userId, cardKey, {
        copies: 0,
        ascension: nextAscension,
        card_level: Math.min(userCard.card_level + 5, 150)
      });

      return { card, ascension: nextAscension };
    },

    async fuse(userId, fusionKey) {
      const fusions = await repos.getFusions();
      const recipe = fusions.find((x) => x.fusion_key === fusionKey);
      if (!recipe) throw new Error('Fusion recipe not found');

      for (const req of recipe.required_cards) {
        const owned = await repos.getUserCard(userId, req);
        if (!owned) throw new Error(`Missing fusion card: ${req}`);
      }
      for (const [materialKey, qty] of Object.entries(recipe.required_materials || {})) {
        await repos.consumeMaterial(userId, materialKey, qty);
      }

      await repos.upsertUserCard(userId, recipe.result_card_key, { copies: 1 });
      return { resultCardKey: recipe.result_card_key, fusionKey: recipe.fusion_key };
    },

    async sacrifice(userId, cardKey) {
      const userCard = await repos.getUserCard(userId, cardKey);
      if (!userCard) throw new Error('Card not owned');
      const card = await repos.getCardByKey(cardKey);
      if (!card) throw new Error('Card missing');

      const payout = card.rarity === 'mythical' ? 260 : card.rarity === 'legendary' ? 150 : 90;
      const animeCfg = await repos.getAnimeConfig(card.anime);
      if (!animeCfg) throw new Error('Anime config missing');

      await repos.removeUserCardCopy(userId, cardKey, 1);
      const balance = await repos.addCurrency(userId, animeCfg.currency, payout);

      return { payout, currency: animeCfg.currency, balance };
    }
  };
}

module.exports = { createCardService };
