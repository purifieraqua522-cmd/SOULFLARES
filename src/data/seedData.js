const cards = [
  { key: 'luffy_base', anime: 'onepiece', display_name: 'Luffy', rarity: 'epic', base_power: 780, evolution_tier: 1, evolution_line: ['luffy_base', 'luffy_snakeman', 'luffy_gear5'] },
  { key: 'luffy_snakeman', anime: 'onepiece', display_name: 'Luffy Snakeman', rarity: 'legendary', base_power: 1400, evolution_tier: 2, evolution_line: ['luffy_base', 'luffy_snakeman', 'luffy_gear5'] },
  { key: 'luffy_gear5', anime: 'onepiece', display_name: 'Luffy Gear 5', rarity: 'mythical', base_power: 2600, evolution_tier: 3, evolution_line: ['luffy_base', 'luffy_snakeman', 'luffy_gear5'] },

  { key: 'naruto_base', anime: 'naruto', display_name: 'Naruto Uzumaki', rarity: 'epic', base_power: 800, evolution_tier: 1, evolution_line: ['naruto_base', 'naruto_kcm', 'naruto_baryon'] },
  { key: 'naruto_kcm', anime: 'naruto', display_name: 'Naruto KCM', rarity: 'legendary', base_power: 1450, evolution_tier: 2, evolution_line: ['naruto_base', 'naruto_kcm', 'naruto_baryon'] },
  { key: 'naruto_baryon', anime: 'naruto', display_name: 'Naruto Baryon', rarity: 'mythical', base_power: 2650, evolution_tier: 3, evolution_line: ['naruto_base', 'naruto_kcm', 'naruto_baryon'] },

  { key: 'ichigo_base', anime: 'bleach', display_name: 'Ichigo', rarity: 'epic', base_power: 770, evolution_tier: 1, evolution_line: ['ichigo_base', 'ichigo_shikai', 'ichigo_bankai'] },
  { key: 'ichigo_shikai', anime: 'bleach', display_name: 'Ichigo Shikai', rarity: 'legendary', base_power: 1380, evolution_tier: 2, evolution_line: ['ichigo_base', 'ichigo_shikai', 'ichigo_bankai'] },
  { key: 'ichigo_bankai', anime: 'bleach', display_name: 'Ichigo Bankai', rarity: 'mythical', base_power: 2550, evolution_tier: 3, evolution_line: ['ichigo_base', 'ichigo_shikai', 'ichigo_bankai'] },

  { key: 'yuji_base', anime: 'jjk', display_name: 'Yuji Itadori', rarity: 'epic', base_power: 790, evolution_tier: 1, evolution_line: ['yuji_base', 'yuji_blackflash', 'yuji_awakened'] },
  { key: 'yuji_blackflash', anime: 'jjk', display_name: 'Yuji Black Flash', rarity: 'legendary', base_power: 1420, evolution_tier: 2, evolution_line: ['yuji_base', 'yuji_blackflash', 'yuji_awakened'] },
  { key: 'yuji_awakened', anime: 'jjk', display_name: 'Yuji Awakened', rarity: 'mythical', base_power: 2600, evolution_tier: 3, evolution_line: ['yuji_base', 'yuji_blackflash', 'yuji_awakened'] },

  { key: 'sung_jin_woo', anime: 'secret', display_name: 'Sung Jin-Woo', rarity: 'secret', base_power: 4200, evolution_tier: 3, evolution_line: ['sung_jin_woo'], secret: true },
  { key: 'cid_kagenou', anime: 'secret', display_name: 'Cid Kagenou', rarity: 'secret', base_power: 4100, evolution_tier: 3, evolution_line: ['cid_kagenou'], secret: true },
  { key: 'anos_voldigoad', anime: 'secret', display_name: 'Anos Voldigoad', rarity: 'secret', base_power: 4300, evolution_tier: 3, evolution_line: ['anos_voldigoad'], secret: true },
  { key: 'gilgamesh', anime: 'secret', display_name: 'Gilgamesh', rarity: 'secret', base_power: 4250, evolution_tier: 3, evolution_line: ['gilgamesh'], secret: true },

  { key: 'gojo_fusion_form', anime: 'jjk', display_name: 'Gojo+Geto Fusion', rarity: 'mythical', base_power: 3800, evolution_tier: 3, evolution_line: ['gojo_fusion_form'], fusion_only: true }
];

const materials = [
  { material_key: 'op_evo_frag', anime: 'onepiece', display_name: 'Conqueror Fragment', rarity: 'rare' },
  { material_key: 'na_evo_seal', anime: 'naruto', display_name: 'Ancient Seal', rarity: 'rare' },
  { material_key: 'bl_evo_core', anime: 'bleach', display_name: 'Reishi Core', rarity: 'rare' },
  { material_key: 'jjk_evo_relic', anime: 'jjk', display_name: 'Cursed Relic', rarity: 'rare' },
  { material_key: 'demon_finger', anime: 'jjk', display_name: 'Demon Finger', rarity: 'legendary' },
  { material_key: 'raid_ticket', anime: 'global', display_name: 'Raid Ticket', rarity: 'rare' },
  { material_key: 'starter_claimed', anime: 'global', display_name: 'Starter Claimed Flag', rarity: 'common' },
  { material_key: 'event_shadow_shard', anime: 'global', display_name: 'Shadow Event Shard', rarity: 'epic' }
];

const bosses = [
  // ONE PIECE - Normal Bosses
  { boss_key: 'doflamingo', anime: 'onepiece', display_name: 'Donquixote Doflamingo', is_super: false, is_event: false, is_secret: false, hp_base: 76000, power_base: 980 },
  { boss_key: 'blackbeard', anime: 'onepiece', display_name: 'Marshall D. Teach', is_super: false, is_event: false, is_secret: false, hp_base: 79000, power_base: 1010 },
  { boss_key: 'mihawk', anime: 'onepiece', display_name: 'Dracule Mihawk', is_super: false, is_event: false, is_secret: false, hp_base: 78000, power_base: 1000 },
  // ONE PIECE - Super Bosses
  { boss_key: 'shanks', anime: 'onepiece', display_name: 'Red-Haired Shanks', is_super: true, is_event: false, is_secret: false, hp_base: 190000, power_base: 2150 },
  { boss_key: 'whitebeard', anime: 'onepiece', display_name: 'Edward Newgate', is_super: true, is_event: false, is_secret: false, hp_base: 198000, power_base: 2230 },
  // ONE PIECE - Secret Boss
  { boss_key: 'imu', anime: 'onepiece', display_name: 'Imu (Secret)', is_super: true, is_event: true, is_secret: true, hp_base: 275000, power_base: 2950 },

  // NARUTO - Normal Bosses
  { boss_key: 'naruto', anime: 'naruto', display_name: 'Naruto Uzumaki', is_super: false, is_event: false, is_secret: false, hp_base: 77000, power_base: 995 },
  { boss_key: 'sasuke', anime: 'naruto', display_name: 'Sasuke Uchiha', is_super: false, is_event: false, is_secret: false, hp_base: 77500, power_base: 1005 },
  { boss_key: 'itachi', anime: 'naruto', display_name: 'Itachi Uchiha', is_super: false, is_event: false, is_secret: false, hp_base: 76000, power_base: 980 },
  // NARUTO - Super Bosses
  { boss_key: 'obito', anime: 'naruto', display_name: 'Obito Uchiha', is_super: true, is_event: false, is_secret: false, hp_base: 188000, power_base: 2120 },
  { boss_key: 'kaguya', anime: 'naruto', display_name: 'Kaguya Otsutsuki', is_super: true, is_event: false, is_secret: false, hp_base: 205000, power_base: 2290 },
  // NARUTO - Secret Boss
  { boss_key: 'madara', anime: 'naruto', display_name: 'Madara Uchiha (Secret)', is_super: true, is_event: true, is_secret: true, hp_base: 268000, power_base: 2890 },

  // BLEACH - Normal Bosses
  { boss_key: 'grimmjow', anime: 'bleach', display_name: 'Grimmjow Jaegerjaquez', is_super: false, is_event: false, is_secret: false, hp_base: 75000, power_base: 970 },
  { boss_key: 'ulquiorra', anime: 'bleach', display_name: 'Ulquiorra Cifer', is_super: false, is_event: false, is_secret: false, hp_base: 76500, power_base: 985 },
  { boss_key: 'kisuke', anime: 'bleach', display_name: 'Kisuke Urahara', is_super: false, is_event: false, is_secret: false, hp_base: 77200, power_base: 995 },
  // BLEACH - Super Bosses
  { boss_key: 'ichigo', anime: 'bleach', display_name: 'Ichigo Kurosaki', is_super: true, is_event: false, is_secret: false, hp_base: 186000, power_base: 2100 },
  { boss_key: 'yhwach', anime: 'bleach', display_name: 'Yhwach', is_super: true, is_event: false, is_secret: false, hp_base: 200000, power_base: 2260 },
  // BLEACH - Secret Boss
  { boss_key: 'aizen', anime: 'bleach', display_name: 'Aizen Sosuke (Secret)', is_super: true, is_event: true, is_secret: true, hp_base: 272000, power_base: 2920 },

  // JJK - Normal Bosses
  { boss_key: 'toji', anime: 'jjk', display_name: 'Toji Fushiguro', is_super: false, is_event: false, is_secret: false, hp_base: 77000, power_base: 1000 },
  { boss_key: 'kashimo', anime: 'jjk', display_name: 'Hajime Kashimo', is_super: false, is_event: false, is_secret: false, hp_base: 78000, power_base: 1010 },
  { boss_key: 'hakari', anime: 'jjk', display_name: 'Kinji Hakari', is_super: false, is_event: false, is_secret: false, hp_base: 77500, power_base: 1005 },
  // JJK - Super Bosses
  { boss_key: 'sukuna', anime: 'jjk', display_name: 'Ryomen Sukuna', is_super: true, is_event: false, is_secret: false, hp_base: 195000, power_base: 2200 },
  { boss_key: 'mahoraga', anime: 'jjk', display_name: 'Eight-Handled Mahoraga', is_super: true, is_event: false, is_secret: false, hp_base: 198000, power_base: 2240 },
  // JJK - Secret Boss
  { boss_key: 'gojo_calamity', anime: 'jjk', display_name: 'Gojo Calamity (Secret)', is_super: true, is_event: true, is_secret: true, hp_base: 278000, power_base: 2980 }
];
const fusions = [
  {
    fusion_key: 'gojo_geto_fusion',
    result_card_key: 'gojo_fusion_form',
    required_cards: ['gojo_max', 'geto_max'],
    required_materials: { demon_finger: 2 }
  }
];

const storeItems = [
  { item_key: 'xp_bottle_small', anime: 'global', item_type: 'xp', display_name: 'XP Bottle (S)', price_currency: 'berries', price_amount: 120, payload: { xp: 250 } },
  { item_key: 'xp_bottle_medium', anime: 'global', item_type: 'xp', display_name: 'XP Bottle (M)', price_currency: 'chakra', price_amount: 280, payload: { xp: 700 } },
  { item_key: 'xp_bottle_large', anime: 'global', item_type: 'xp', display_name: 'XP Bottle (L)', price_currency: 'reiryoku', price_amount: 600, payload: { xp: 1800 } },
  { item_key: 'raid_ticket_single', anime: 'global', item_type: 'ticket', display_name: 'Raid Ticket', price_currency: 'cursed_energy', price_amount: 220, payload: { tickets: 1 } },
  { item_key: 'raid_ticket_bundle', anime: 'global', item_type: 'ticket', display_name: 'Raid Ticket Bundle', price_currency: 'berries', price_amount: 980, payload: { tickets: 5 } },
  { item_key: 'op_frag_pack', anime: 'onepiece', item_type: 'material', display_name: 'One Piece Evolution Pack', price_currency: 'berries', price_amount: 320, payload: { material_key: 'op_evo_frag', qty: 2 } },
  { item_key: 'naruto_seal_pack', anime: 'naruto', item_type: 'material', display_name: 'Naruto Seal Pack', price_currency: 'chakra', price_amount: 320, payload: { material_key: 'na_evo_seal', qty: 2 } },
  { item_key: 'bleach_core_pack', anime: 'bleach', item_type: 'material', display_name: 'Reishi Core Pack', price_currency: 'reiryoku', price_amount: 320, payload: { material_key: 'bl_evo_core', qty: 2 } },
  { item_key: 'jjk_relic_pack', anime: 'jjk', item_type: 'material', display_name: 'JJK Relic Pack', price_currency: 'cursed_energy', price_amount: 320, payload: { material_key: 'jjk_evo_relic', qty: 2 } },
  { item_key: 'jjk_demon_finger', anime: 'jjk', item_type: 'material', display_name: 'Demon Finger (Event)', price_currency: 'cursed_energy', price_amount: 2200, payload: { material_key: 'demon_finger', qty: 1 } },
  { item_key: 'event_shadow_shard', anime: 'global', item_type: 'material', display_name: 'Shadow Shard', price_currency: 'berries', price_amount: 1600, payload: { material_key: 'event_shadow_shard', qty: 1 } },

  // Card section (buy cards directly)
  { item_key: 'op_card_mihawk', anime: 'onepiece', item_type: 'card', display_name: 'Mihawk Card', price_currency: 'berries', price_amount: 1250, payload: { card_key: 'mihawk', copies: 1 } },
  { item_key: 'op_card_shanks', anime: 'onepiece', item_type: 'card', display_name: 'Shanks Card', price_currency: 'berries', price_amount: 3600, payload: { card_key: 'shanks', copies: 1 } },
  { item_key: 'na_card_itachi', anime: 'naruto', item_type: 'card', display_name: 'Itachi Card', price_currency: 'chakra', price_amount: 1250, payload: { card_key: 'itachi', copies: 1 } },
  { item_key: 'na_card_obito', anime: 'naruto', item_type: 'card', display_name: 'Obito Card', price_currency: 'chakra', price_amount: 3600, payload: { card_key: 'obito', copies: 1 } },
  { item_key: 'bl_card_ulquiorra', anime: 'bleach', item_type: 'card', display_name: 'Ulquiorra Card', price_currency: 'reiryoku', price_amount: 1250, payload: { card_key: 'ulquiorra', copies: 1 } },
  { item_key: 'bl_card_ichigo', anime: 'bleach', item_type: 'card', display_name: 'Ichigo Card', price_currency: 'reiryoku', price_amount: 3600, payload: { card_key: 'ichigo', copies: 1 } },
  { item_key: 'jjk_card_hakari', anime: 'jjk', item_type: 'card', display_name: 'Hakari Card', price_currency: 'cursed_energy', price_amount: 1250, payload: { card_key: 'hakari', copies: 1 } },
  { item_key: 'jjk_card_sukuna', anime: 'jjk', item_type: 'card', display_name: 'Sukuna Card', price_currency: 'cursed_energy', price_amount: 3600, payload: { card_key: 'sukuna', copies: 1 } }
];

module.exports = { cards, materials, bosses, fusions, storeItems };
