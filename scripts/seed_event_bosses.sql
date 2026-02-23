-- SOULFALRES: Custom boss roster seed (safe to run multiple times)

BEGIN;

ALTER TABLE bosses ADD COLUMN IF NOT EXISTS is_event boolean NOT NULL DEFAULT false;
ALTER TABLE bosses ADD COLUMN IF NOT EXISTS is_secret boolean NOT NULL DEFAULT false;

INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, is_secret, hp_base, power_base, drop_table)
VALUES
  -- ONE PIECE
  ('doflamingo', 'onepiece', 'Donquixote Doflamingo', false, false, false, 76000, 980, '{}'::jsonb),
  ('blackbeard', 'onepiece', 'Marshall D. Teach', false, false, false, 79000, 1010, '{}'::jsonb),
  ('mihawk', 'onepiece', 'Dracule Mihawk', false, false, false, 78000, 1000, '{}'::jsonb),
  ('shanks', 'onepiece', 'Red-Haired Shanks', true, false, false, 190000, 2150, '{}'::jsonb),
  ('whitebeard', 'onepiece', 'Edward Newgate', true, false, false, 198000, 2230, '{}'::jsonb),
  ('imu', 'onepiece', 'Imu (Secret)', true, true, true, 275000, 2950, '{}'::jsonb),

  -- NARUTO
  ('naruto', 'naruto', 'Naruto Uzumaki', false, false, false, 77000, 995, '{}'::jsonb),
  ('sasuke', 'naruto', 'Sasuke Uchiha', false, false, false, 77500, 1005, '{}'::jsonb),
  ('itachi', 'naruto', 'Itachi Uchiha', false, false, false, 76000, 980, '{}'::jsonb),
  ('obito', 'naruto', 'Obito Uchiha', true, false, false, 188000, 2120, '{}'::jsonb),
  ('kaguya', 'naruto', 'Kaguya Otsutsuki', true, false, false, 205000, 2290, '{}'::jsonb),
  ('madara', 'naruto', 'Madara Uchiha (Secret)', true, true, true, 268000, 2890, '{}'::jsonb),

  -- BLEACH
  ('grimmjow', 'bleach', 'Grimmjow Jaegerjaquez', false, false, false, 75000, 970, '{}'::jsonb),
  ('ulquiorra', 'bleach', 'Ulquiorra Cifer', false, false, false, 76500, 985, '{}'::jsonb),
  ('kisuke', 'bleach', 'Kisuke Urahara', false, false, false, 77200, 995, '{}'::jsonb),
  ('ichigo', 'bleach', 'Ichigo Kurosaki', true, false, false, 186000, 2100, '{}'::jsonb),
  ('yhwach', 'bleach', 'Yhwach', true, false, false, 200000, 2260, '{}'::jsonb),
  ('aizen', 'bleach', 'Aizen Sosuke (Secret)', true, true, true, 272000, 2920, '{}'::jsonb),

  -- JJK
  ('toji', 'jjk', 'Toji Fushiguro', false, false, false, 77000, 1000, '{}'::jsonb),
  ('kashimo', 'jjk', 'Hajime Kashimo', false, false, false, 78000, 1010, '{}'::jsonb),
  ('hakari', 'jjk', 'Kinji Hakari', false, false, false, 77500, 1005, '{}'::jsonb),
  ('sukuna', 'jjk', 'Ryomen Sukuna', true, false, false, 195000, 2200, '{}'::jsonb),
  ('mahoraga', 'jjk', 'Eight-Handled Mahoraga', true, false, false, 198000, 2240, '{}'::jsonb),
  ('gojo_calamity', 'jjk', 'Gojo Calamity (Secret)', true, true, true, 278000, 2980, '{}'::jsonb)
ON CONFLICT (boss_key) DO UPDATE SET
  anime = EXCLUDED.anime,
  display_name = EXCLUDED.display_name,
  is_super = EXCLUDED.is_super,
  is_event = EXCLUDED.is_event,
  is_secret = EXCLUDED.is_secret,
  hp_base = EXCLUDED.hp_base,
  power_base = EXCLUDED.power_base,
  drop_table = EXCLUDED.drop_table;

SELECT boss_key, anime, display_name, is_super, is_event, is_secret, hp_base, power_base
FROM bosses
ORDER BY anime, is_secret DESC, is_super DESC, boss_key;

COMMIT;