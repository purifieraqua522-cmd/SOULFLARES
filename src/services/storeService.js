function createStoreService(repos) {
  return {
    async list(anime) {
      return repos.getStoreItems(anime);
    },

    async buy(userId, itemKey) {
      await repos.ensureProfile(userId);
      const item = await repos.getStoreItem(itemKey);
      if (!item) throw new Error('Store item not found');

      await repos.spendCurrency(userId, item.price_currency, item.price_amount);

      let effect = 'Purchased.';
      if (item.item_type === 'material') {
        const qty = item.payload.qty || 1;
        await repos.addMaterial(userId, item.payload.material_key, qty);
        effect = `Material +${qty} (${item.payload.material_key})`;
      }
      if (item.item_type === 'ticket') {
        const qty = item.payload.tickets || 1;
        await repos.addMaterial(userId, 'raid_ticket', qty);
        effect = `Raid Ticket +${qty}`;
      }
      if (item.item_type === 'xp') {
        const xp = item.payload.xp || 0;
        const nextXp = await repos.addProfileXp(userId, xp);
        effect = `Profile XP +${xp} (total ${nextXp})`;
      }
      if (item.item_type === 'currency') {
        const amount = item.payload.amount || 0;
        await repos.addCurrency(userId, item.payload.currency, amount);
        effect = `Currency +${amount} (${item.payload.currency})`;
      }

      const wallet = await repos.getWallet(userId);
      return { item, effect, wallet };
    }
  };
}

module.exports = { createStoreService };
