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
  { boss_key: 'kizaru', anime: 'onepiece', display_name: 'Admiral Kizaru', is_super: false, is_event: false, hp_base: 45000, power_base: 680 },
  { boss_key: 'mihawk', anime: 'onepiece', display_name: 'Dracule Mihawk', is_super: false, is_event: false, hp_base: 48000, power_base: 700 },
  { boss_key: 'aokiji', anime: 'onepiece', display_name: 'Admiral Aokiji', is_super: false, is_event: false, hp_base: 46000, power_base: 690 },
  { boss_key: 'kaido', anime: 'onepiece', display_name: 'Kaido', is_super: true, is_event: false, hp_base: 115000, power_base: 1450 },
  // ONE PIECE - Event Bosses
  { boss_key: 'luffy_awakened', anime: 'onepiece', display_name: 'Awakened Luffy (Event)', is_super: false, is_event: true, hp_base: 52000, power_base: 750 },
  { boss_key: 'blackbeard_event', anime: 'onepiece', display_name: 'Blackbeard Rampage (Event)', is_super: false, is_event: true, hp_base: 54000, power_base: 770 },
  { boss_key: 'whitebeard_festival', anime: 'onepiece', display_name: 'Whitebeard Festival (Event)', is_super: true, is_event: true, hp_base: 130000, power_base: 1600 },

  // NARUTO - Normal Bosses
  { boss_key: 'itachi', anime: 'naruto', display_name: 'Itachi Uchiha', is_super: false, is_event: false, hp_base: 43000, power_base: 650 },
  { boss_key: 'pain', anime: 'naruto', display_name: 'Pain', is_super: false, is_event: false, hp_base: 47000, power_base: 700 },
  { boss_key: 'kisame', anime: 'naruto', display_name: 'Kisame', is_super: false, is_event: false, hp_base: 45000, power_base: 680 },
  { boss_key: 'madara', anime: 'naruto', display_name: 'Madara Uchiha', is_super: true, is_event: false, hp_base: 120000, power_base: 1500 },
  // NARUTO - Event Bosses
  { boss_key: 'naruto_nine_tails', anime: 'naruto', display_name: 'Naruto Nine-Tails (Event)', is_super: false, is_event: true, hp_base: 51000, power_base: 740 },
  { boss_key: 'sasuke_awakened', anime: 'naruto', display_name: 'Sasuke Awakened (Event)', is_super: false, is_event: true, hp_base: 50000, power_base: 730 },
  { boss_key: 'otsutsuki_kaguya', anime: 'naruto', display_name: 'Kaguya Ōtsutsuki (Event)', is_super: true, is_event: true, hp_base: 135000, power_base: 1650 },

  // BLEACH - Normal Bosses
  { boss_key: 'ulquiorra', anime: 'bleach', display_name: 'Ulquiorra', is_super: false, is_event: false, hp_base: 43000, power_base: 640 },
  { boss_key: 'grimmjow', anime: 'bleach', display_name: 'Grimmjow', is_super: false, is_event: false, hp_base: 45000, power_base: 670 },
  { boss_key: 'byakuya', anime: 'bleach', display_name: 'Byakuya', is_super: false, is_event: false, hp_base: 46000, power_base: 690 },
  { boss_key: 'yhwach', anime: 'bleach', display_name: 'Yhwach', is_super: true, is_event: false, hp_base: 112000, power_base: 1420 },
  // BLEACH - Event Bosses
  { boss_key: 'aizen_final', anime: 'bleach', display_name: 'Aizen Final Form (Event)', is_super: false, is_event: true, hp_base: 50000, power_base: 720 },
  { boss_key: 'ichigo_hollow', anime: 'bleach', display_name: 'Ichigo Hollow (Event)', is_super: false, is_event: true, hp_base: 53000, power_base: 760 },
  { boss_key: 'soul_king_event', anime: 'bleach', display_name: 'Soul King Ceremony (Event)', is_super: true, is_event: true, hp_base: 128000, power_base: 1580 },

  // JJK - Normal Bosses
  { boss_key: 'jogo', anime: 'jjk', display_name: 'Jogo', is_super: false, is_event: false, hp_base: 42000, power_base: 630 },
  { boss_key: 'mahito', anime: 'jjk', display_name: 'Mahito', is_super: false, is_event: false, hp_base: 45000, power_base: 670 },
  { boss_key: 'hanami', anime: 'jjk', display_name: 'Hanami', is_super: false, is_event: false, hp_base: 44000, power_base: 660 },
  { boss_key: 'sukuna_true', anime: 'jjk', display_name: 'Sukuna True Form', is_super: true, is_event: false, hp_base: 125000, power_base: 1550 },
  // JJK - Event Bosses
  { boss_key: 'gojo_rampage', anime: 'jjk', display_name: 'Gojo Rampage (Event)', is_super: false, is_event: true, hp_base: 55000, power_base: 800 },
  { boss_key: 'toji_awakened', anime: 'jjk', display_name: 'Toji Awakened (Event)', is_super: false, is_event: true, hp_base: 49000, power_base: 710 },
  { boss_key: 'kenjaku_convergence', anime: 'jjk', display_name: 'Kenjaku Convergence (Event)', is_super: true, is_event: true, hp_base: 132000, power_base: 1620 }
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
  { item_key: 'event_shadow_shard', anime: 'global', item_type: 'material', display_name: 'Shadow Shard', price_currency: 'berries', price_amount: 1600, payload: { material_key: 'event_shadow_shard', qty: 1 } }
];

module.exports = { cards, materials, bosses, fusions, storeItems };
