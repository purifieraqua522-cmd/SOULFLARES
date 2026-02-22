const { safeDb } = require('../core/safeDb');

function createRepositories(db) {
  return {
    async ensureProfile(userId) {
      await safeDb(db.from('profiles').upsert({ user_id: userId }, { onConflict: 'user_id' }), 'ensureProfile');
      await safeDb(db.from('wallets').upsert({ user_id: userId }, { onConflict: 'user_id' }), 'ensureWallet');
    },

    async getProfile(userId) {
      const rows = await safeDb(db.from('profiles').select('*').eq('user_id', userId).limit(1), 'getProfile');
      return rows[0] || null;
    },

    async getWallet(userId) {
      const rows = await safeDb(db.from('wallets').select('*').eq('user_id', userId).limit(1), 'getWallet');
      return rows[0] || null;
    },

    async addCurrency(userId, currencyKey, amount) {
      await this.ensureProfile(userId);
      const wallet = await this.getWallet(userId);
      const next = Number(wallet[currencyKey] || 0) + amount;
      await safeDb(db.from('wallets').update({ [currencyKey]: next }).eq('user_id', userId), 'addCurrency');
      return next;
    },

    async spendCurrency(userId, currencyKey, amount) {
      await this.ensureProfile(userId);
      const wallet = await this.getWallet(userId);
      const current = Number(wallet[currencyKey] || 0);
      if (current < amount) throw new Error('Insufficient currency');
      const next = current - amount;
      await safeDb(db.from('wallets').update({ [currencyKey]: next }).eq('user_id', userId), 'spendCurrency');
      return next;
    },

    async getCardsByAnime(anime) {
      return safeDb(db.from('cards').select('*').eq('anime', anime), 'getCardsByAnime');
    },

    async upsertCards(cards) {
      if (!cards.length) return [];
      return safeDb(db.from('cards').upsert(cards, { onConflict: 'key' }).select('*'), 'upsertCards');
    },

    async getCardByKey(cardKey) {
      const rows = await safeDb(db.from('cards').select('*').eq('key', cardKey).limit(1), 'getCardByKey');
      return rows[0] || null;
    },

    async getUserCards(userId) {
      return safeDb(db.from('user_cards').select('*').eq('user_id', userId), 'getUserCards');
    },

    async getUserCard(userId, cardKey) {
      const rows = await safeDb(
        db.from('user_cards').select('*').eq('user_id', userId).eq('card_key', cardKey).limit(1),
        'getUserCard'
      );
      return rows[0] || null;
    },

    async upsertUserCard(userId, cardKey, data = {}) {
      const current = await this.getUserCard(userId, cardKey);
      if (current) {
        const patch = {
          copies: current.copies + (data.copies || 0),
          card_xp: data.card_xp ?? current.card_xp,
          card_level: data.card_level ?? current.card_level,
          ascension: data.ascension ?? current.ascension,
          equipped_gear: data.equipped_gear ?? current.equipped_gear
        };
        await safeDb(
          db.from('user_cards').update(patch).eq('id', current.id),
          'updateUserCard'
        );
        return { ...current, ...patch };
      }

      const payload = {
        user_id: userId,
        card_key: cardKey,
        copies: data.copies || 1,
        card_xp: data.card_xp || 0,
        card_level: data.card_level || 1,
        ascension: data.ascension || 0,
        equipped_gear: data.equipped_gear || {}
      };
      const rows = await safeDb(db.from('user_cards').insert(payload).select('*'), 'insertUserCard');
      return rows[0];
    },

    async removeUserCardCopy(userId, cardKey, copies = 1) {
      const current = await this.getUserCard(userId, cardKey);
      if (!current || current.copies < copies) throw new Error('Not enough copies');
      if (current.copies === copies) {
        await safeDb(db.from('user_cards').delete().eq('id', current.id), 'deleteUserCard');
        return null;
      }
      const next = current.copies - copies;
      await safeDb(db.from('user_cards').update({ copies: next }).eq('id', current.id), 'removeUserCardCopy');
      return { ...current, copies: next };
    },

    async addMaterial(userId, materialKey, qty = 1) {
      const rows = await safeDb(
        db.from('inventory_materials').select('*').eq('user_id', userId).eq('material_key', materialKey).limit(1),
        'getMaterial'
      );
      if (!rows[0]) {
        await safeDb(
          db.from('inventory_materials').insert({ user_id: userId, material_key: materialKey, qty }),
          'insertMaterial'
        );
        return qty;
      }
      const next = rows[0].qty + qty;
      await safeDb(
        db.from('inventory_materials').update({ qty: next }).eq('user_id', userId).eq('material_key', materialKey),
        'updateMaterial'
      );
      return next;
    },

    async getMaterials(userId) {
      return safeDb(db.from('inventory_materials').select('*').eq('user_id', userId), 'getMaterials');
    },

    async consumeMaterial(userId, materialKey, qty = 1) {
      const rows = await safeDb(
        db.from('inventory_materials').select('*').eq('user_id', userId).eq('material_key', materialKey).limit(1),
        'consumeMaterial.read'
      );
      const item = rows[0];
      if (!item || item.qty < qty) throw new Error('Material missing');
      const next = item.qty - qty;
      await safeDb(
        db.from('inventory_materials').update({ qty: next }).eq('user_id', userId).eq('material_key', materialKey),
        'consumeMaterial.write'
      );
      return next;
    },

    async getFusions() {
      return safeDb(db.from('fusions').select('*'), 'getFusions');
    },

    async createActiveBoss(payload) {
      const rows = await safeDb(db.from('active_bosses').insert(payload).select('*'), 'createActiveBoss');
      return rows[0];
    },

    async getOpenBosses() {
      return safeDb(db.from('active_bosses').select('*').eq('state', 'open'), 'getOpenBosses');
    },

    async getVisibleBosses() {
      return safeDb(
        db.from('active_bosses').select('*').in('state', ['open', 'active']).order('spawned_at', { ascending: false }),
        'getVisibleBosses'
      );
    },

    async getAttackableBosses() {
      return safeDb(
        db.from('active_bosses').select('*').in('state', ['open', 'active']).order('spawned_at', { ascending: false }),
        'getAttackableBosses'
      );
    },

    async updateBoss(id, patch) {
      const rows = await safeDb(db.from('active_bosses').update(patch).eq('id', id).select('*'), 'updateBoss');
      return rows[0] || null;
    },

    async getBossByKey(bossKey) {
      const rows = await safeDb(db.from('bosses').select('*').eq('boss_key', bossKey).limit(1), 'getBossByKey');
      return rows[0] || null;
    },

    async getAllBosses() {
      return safeDb(db.from('bosses').select('*').order('anime').order('is_super', { ascending: true }), 'getAllBosses');
    },

    async getAnimeConfig(anime) {
      const rows = await safeDb(db.from('anime_config').select('*').eq('anime', anime).limit(1), 'getAnimeConfig');
      return rows[0] || null;
    },

    async getStoreItems(anime) {
      const query = db.from('store_items').select('*').eq('active', true);
      const scoped = anime ? query.eq('anime', anime) : query;
      return safeDb(scoped, 'getStoreItems');
    },

    async getStoreItem(itemKey) {
      const rows = await safeDb(db.from('store_items').select('*').eq('item_key', itemKey).limit(1), 'getStoreItem');
      return rows[0] || null;
    },

    async createRaid(payload) {
      const rows = await safeDb(db.from('raids').insert(payload).select('*'), 'createRaid');
      return rows[0];
    },

    async getRaid(raidId) {
      const rows = await safeDb(db.from('raids').select('*').eq('id', raidId).limit(1), 'getRaid');
      return rows[0] || null;
    },

    async getJoinableRaids() {
      return safeDb(
        db.from('raids').select('*').or('state.eq.lobby,state.eq.active').order('created_at', { ascending: false }).limit(25),
        'getJoinableRaids'
      );
    },

    async updateRaid(raidId, patch) {
      const rows = await safeDb(db.from('raids').update(patch).eq('id', raidId).select('*'), 'updateRaid');
      return rows[0] || null;
    }
  };
}

module.exports = { createRepositories };
