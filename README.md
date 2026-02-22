# SOULFALRES Bot

The main bot of the SOULFALRES server.

Discord anime card game bot (JavaScript + discord.js + Supabase).

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
- Owner manual boss control by exact boss key
- Asset-based card ingestion from `assets/cards`
- Automatic PNG generation with local uploaded card art

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

4. Seed core data + sync card assets
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

## Assets Folder (Auto)
Use this structure:

```text
assets/
  cards/
    onepiece/
      luffy_gear5.png
    naruto/
      naruto_baryon.png
    bleach/
      ichigo_bankai.png
    jjk/
      gojo_limitless.png
    secret/
      sung_jin_woo.png
  fonts/
    Orbitron-Regular.ttf
```

Rules:
- The file name becomes the card key + display name.
- Example: `gojo_limitless.png` -> key `gojo_limitless`, display name `Gojo Limitless`.
- Place files under anime folders: `onepiece`, `naruto`, `bleach`, `jjk`, `secret`.
- On startup, the bot auto-syncs these files into the `cards` table.
- You can force resync with:
```bash
npm run sync:assets
```

## Font Loading (Hetzner / Railway)
The bot automatically registers fonts from:
- `assets/fonts`
- extra paths from `FONT_PATHS` (comma-separated)

Environment options:
- `FONT_PATHS=/app/fonts,/usr/share/fonts/custom`
- `PRIMARY_FONT_FAMILY=Orbitron Regular`

If no custom font is found, it falls back to system/canvas fonts.

## Slash Commands
- `/summon`
- `/card view|info|evolve|fuse|merge|sacrifice`
  - `card view` supports optional `custom_name`
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
- `/spawnboss list|spawn`
- `/assets sync`

## Notes
- The bot uses components v2 style responses where possible, with fallback support.
- You can store custom emojis in `anime_config` (`currency_emoji`, `pack_emoji`).
- If global commands are used (no `DISCORD_GUILD_ID`), Discord can take time to show updates.
