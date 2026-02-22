function createStoreService(repos) {
  return {
    async list(anime) {
      return repos.getStoreItems(anime);
    },

    async buy(userId, itemKey) {
      const item = await repos.getStoreItem(itemKey);
      if (!item) throw new Error('Store item not found');

      await repos.spendCurrency(userId, item.price_currency, item.price_amount);

      if (item.item_type === 'material') {
        await repos.addMaterial(userId, item.payload.material_key, item.payload.qty || 1);
      }

      return item;
    }
  };
}

module.exports = { createStoreService };
