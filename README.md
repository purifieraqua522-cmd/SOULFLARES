# SOULFALRES Bot

Building one of the best custom bots for the SOULFARES server.

Discord Anime Card Game Bot (JavaScript, discord.js v14, Supabase).

## Stack
- Node.js + discord.js
- Supabase (Postgres) as primary database
- Component-based responses (including error UI)
- Automatic PNG card generation via `@napi-rs/canvas`

## Features
- Multi anime systems: One Piece / Naruto / Bleach / JJK
- Summon/pull with separate anime currencies
- Evolution (Epic -> Legendary -> Mythical)
- Merge/Ascension
- Fusion recipes
- Boss system with scheduler
- Normal bosses every full hour
- Super bosses every 2 hours
- Raid system (start/join)
- Store + Inventory
- Utility guides
- Admin commands (`/addcurrency`) + owner command (`/spawnboss`)

## Setup
1. Install dependencies
```bash
npm install
```

2. Create `.env` from template
```bash
cp .env.example .env
```

3. Run `sql.sql` in Supabase SQL editor.

4. Seed core data
```bash
npm run seed
```

5. Deploy slash commands
```bash
npm run deploy:commands
```

6. Start bot
```bash
npm start
```

## Slash Commands
- `/summon`
- `/card view|info|evolve|fuse|merge|sacrifice`
- `/boss list|vote|attack`
- `/raid start|join`
- `/fight`
- `/clash`
- `/inventory`
- `/store view|buy`
- `/gear guide`
- `/fusion guide`
- `/evo guide`
- `/bossguide`
- `/addcurrency`
- `/spawnboss`

## Notes
- The bot uses components v2 style responses where possible with fallback support.
- You can store custom emojis in `anime_config` (`currency_emoji`, `pack_emoji`).
- Add your own font at `assets/Orbitron-Regular.ttf` if needed.
