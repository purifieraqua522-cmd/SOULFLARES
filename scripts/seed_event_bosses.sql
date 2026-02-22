-- SOULFALRES: Event boss seed (safe to run multiple times)
-- This script is idempotent and can be re-run anytime.

BEGIN;

-- Ensure required column exists (older schemas may miss this)
ALTER TABLE bosses
ADD COLUMN IF NOT EXISTS is_event boolean NOT NULL DEFAULT false;

-- ONE PIECE Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES
  ('luffy_awakened', 'onepiece', 'Awakened Luffy (Event)', false, true, 52000, 750, '{}'::jsonb),
  ('blackbeard_event', 'onepiece', 'Blackbeard Rampage (Event)', false, true, 54000, 770, '{}'::jsonb),
  ('whitebeard_festival', 'onepiece', 'Whitebeard Festival (Event)', true, true, 130000, 1600, '{}'::jsonb)
ON CONFLICT (boss_key) DO UPDATE SET
  anime = EXCLUDED.anime,
  display_name = EXCLUDED.display_name,
  is_super = EXCLUDED.is_super,
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base,
  drop_table = EXCLUDED.drop_table;

-- NARUTO Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES
  ('naruto_nine_tails', 'naruto', 'Naruto Nine-Tails (Event)', false, true, 51000, 740, '{}'::jsonb),
  ('sasuke_awakened', 'naruto', 'Sasuke Awakened (Event)', false, true, 50000, 730, '{}'::jsonb),
  ('otsutsuki_kaguya', 'naruto', 'Kaguya Otsutsuki (Event)', true, true, 135000, 1650, '{}'::jsonb)
ON CONFLICT (boss_key) DO UPDATE SET
  anime = EXCLUDED.anime,
  display_name = EXCLUDED.display_name,
  is_super = EXCLUDED.is_super,
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base,
  drop_table = EXCLUDED.drop_table;

-- BLEACH Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES
  ('aizen_final', 'bleach', 'Aizen Final Form (Event)', false, true, 50000, 720, '{}'::jsonb),
  ('ichigo_hollow', 'bleach', 'Ichigo Hollow (Event)', false, true, 53000, 760, '{}'::jsonb),
  ('soul_king_event', 'bleach', 'Soul King Ceremony (Event)', true, true, 128000, 1580, '{}'::jsonb)
ON CONFLICT (boss_key) DO UPDATE SET
  anime = EXCLUDED.anime,
  display_name = EXCLUDED.display_name,
  is_super = EXCLUDED.is_super,
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base,
  drop_table = EXCLUDED.drop_table;

-- JJK Event Bosses
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base, drop_table)
VALUES
  ('gojo_rampage', 'jjk', 'Gojo Rampage (Event)', false, true, 55000, 800, '{}'::jsonb),
  ('toji_awakened', 'jjk', 'Toji Awakened (Event)', false, true, 49000, 710, '{}'::jsonb),
  ('kenjaku_convergence', 'jjk', 'Kenjaku Convergence (Event)', true, true, 132000, 1620, '{}'::jsonb)
ON CONFLICT (boss_key) DO UPDATE SET
  anime = EXCLUDED.anime,
  display_name = EXCLUDED.display_name,
  is_super = EXCLUDED.is_super,
  is_event = EXCLUDED.is_event,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base,
  drop_table = EXCLUDED.drop_table;

-- Verify event bosses
SELECT boss_key, anime, display_name, is_super, is_event
FROM bosses
WHERE is_event = true
ORDER BY anime, is_super DESC, boss_key;

COMMIT;

-- Optional for Supabase PostgREST schema cache refresh if API still says column missing:
-- NOTIFY pgrst, 'reload schema';