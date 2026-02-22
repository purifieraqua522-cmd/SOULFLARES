-- Insert Event Bosses for Each Anime
-- Run this after adding the is_event column to the bosses table

-- ONE PIECE Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES 
  ('luffy_awakened', 'onepiece', 'Awakened Luffy (Event)', false, true, 52000, 750, '{}'),
  ('blackbeard_event', 'onepiece', 'Blackbeard Rampage (Event)', false, true, 54000, 770, '{}'),
  ('whitebeard_festival', 'onepiece', 'Whitebeard Festival (Event)', true, true, 130000, 1600, '{}')
ON CONFLICT (boss_key) DO UPDATE SET
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base;

-- NARUTO Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES 
  ('naruto_nine_tails', 'naruto', 'Naruto Nine-Tails (Event)', false, true, 51000, 740, '{}'),
  ('sasuke_awakened', 'naruto', 'Sasuke Awakened (Event)', false, true, 50000, 730, '{}'),
  ('otsutsuki_kaguya', 'naruto', 'Kaguya Ōtsutsuki (Event)', true, true, 135000, 1650, '{}')
ON CONFLICT (boss_key) DO UPDATE SET
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base;

-- BLEACH Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES 
  ('aizen_final', 'bleach', 'Aizen Final Form (Event)', false, true, 50000, 720, '{}'),
  ('ichigo_hollow', 'bleach', 'Ichigo Hollow (Event)', false, true, 53000, 760, '{}'),
  ('soul_king_event', 'bleach', 'Soul King Ceremony (Event)', true, true, 128000, 1580, '{}')
ON CONFLICT (boss_key) DO UPDATE SET
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base;

-- JJK Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES 
  ('gojo_rampage', 'jjk', 'Gojo Rampage (Event)', false, true, 55000, 800, '{}'),
  ('toji_awakened', 'jjk', 'Toji Awakened (Event)', false, true, 49000, 710, '{}'),
  ('kenjaku_convergence', 'jjk', 'Kenjaku Convergence (Event)', true, true, 132000, 1620, '{}')
ON CONFLICT (boss_key) DO UPDATE SET
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base;

-- Verify the event bosses were inserted
SELECT boss_key, anime, display_name, is_super, is_event 
FROM bosses 
WHERE is_event = true 
ORDER BY anime, is_super DESC;
