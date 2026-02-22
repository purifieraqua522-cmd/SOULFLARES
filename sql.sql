-- SOULFALRES Supabase schema please but this into the SQL editor in supabase and run it to set up the database 
create extension if not exists pgcrypto;

create table if not exists profiles (
  user_id text primary key,
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallets (
  user_id text primary key references profiles(user_id) on delete cascade,
  berries bigint not null default 0,
  chakra bigint not null default 0,
  reiryoku bigint not null default 0,
  cursed_energy bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  anime text not null,
  display_name text not null,
  rarity text not null,
  base_power int not null,
  evolution_tier int not null default 1,
  evolution_line text[] not null default '{}',
  secret boolean not null default false,
  fusion_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(user_id) on delete cascade,
  card_key text not null references cards(key) on delete cascade,
  card_level int not null default 1,
  card_xp int not null default 0,
  ascension int not null default 0,
  copies int not null default 1,
  equipped_gear jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, card_key)
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  material_key text unique not null,
  anime text not null,
  display_name text not null,
  rarity text not null,
  created_at timestamptz not null default now()
);

create table if not exists inventory_materials (
  user_id text not null references profiles(user_id) on delete cascade,
  material_key text not null references materials(material_key) on delete cascade,
  qty int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, material_key)
);

create table if not exists bosses (
  id uuid primary key default gen_random_uuid(),
  boss_key text unique not null,
  anime text not null,
  display_name text not null,
  is_super boolean not null default false,
  hp_base int not null,
  power_base int not null,
  drop_table jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists active_bosses (
  id uuid primary key default gen_random_uuid(),
  boss_key text not null references bosses(boss_key) on delete cascade,
  difficulty text not null,
  hp_current int not null,
  hp_max int not null,
  spawned_at timestamptz not null default now(),
  expires_at timestamptz not null,
  state text not null default 'open',
  participants jsonb not null default '[]'::jsonb
);

create table if not exists raids (
  id uuid primary key default gen_random_uuid(),
  anime text not null,
  host_user_id text not null references profiles(user_id) on delete cascade,
  difficulty text not null,
  required_power int not null,
  state text not null default 'lobby',
  members jsonb not null default '[]'::jsonb,
  rewards_seed text not null,
  created_at timestamptz not null default now()
);

create table if not exists fusions (
  id uuid primary key default gen_random_uuid(),
  fusion_key text unique not null,
  result_card_key text not null references cards(key) on delete cascade,
  required_cards text[] not null,
  required_materials jsonb not null default '{}'::jsonb
);

create table if not exists store_items (
  item_key text primary key,
  anime text not null,
  item_type text not null,
  display_name text not null,
  price_currency text not null,
  price_amount int not null,
  payload jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table if not exists anime_config (
  anime text primary key,
  summon_name text not null,
  currency text not null,
  currency_emoji text not null default '',
  pack_emoji text not null default '',
  evolve_material_key text not null,
  boss_rotation text[] not null,
  super_boss_key text not null
);

create table if not exists drop_pity (
  user_id text not null references profiles(user_id) on delete cascade,
  anime text not null,
  pity_counter int not null default 0,
  primary key (user_id, anime)
);

create index if not exists idx_user_cards_user_id on user_cards(user_id);
create index if not exists idx_active_bosses_state on active_bosses(state);
create index if not exists idx_raids_state on raids(state);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
for each row execute function set_updated_at();

create trigger wallets_updated_at before update on wallets
for each row execute function set_updated_at();

create trigger user_cards_updated_at before update on user_cards
for each row execute function set_updated_at();


insert into anime_config (anime, summon_name, currency, evolve_material_key, boss_rotation, super_boss_key)
values
  ('onepiece', 'Pirate Packs', 'berries', 'op_evo_frag', array['kizaru','mihawk','aokiji'], 'kaido'),
  ('naruto', 'Chakra Summoning', 'chakra', 'na_evo_seal', array['itachi','pain','kisame'], 'madara'),
  ('bleach', 'Shinigami Pull', 'reiryoku', 'bl_evo_core', array['ulquiorra','grimmjow','byakuya'], 'yhwach'),
  ('jjk', 'Cursed Pack', 'cursed_energy', 'jjk_evo_relic', array['jogo','mahito','hanami'], 'sukuna_true')
on conflict (anime) do nothing;
