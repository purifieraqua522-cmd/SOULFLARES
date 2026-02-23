# Boss System Update - Setup Guide

## Was hat sich geändert?

Das Boss-System wurde überarbeitet für bessere Auswahl und Event-Bosse:

### Neue Features:
1. **Event-Bosse für jedes Anime** - Spezielle Boss-Varianten für Events
2. **Besseres Verwaltungs-Interface** - `/spawnboss` Kommando mit separaten Subkommandos:
   - `/spawnboss list` - Alle Bosse nach Typ und Anime auflisten
   - `/spawnboss normal <anime> <boss>` - Normal Boss spawnen
   - `/spawnboss event <anime> <boss>` - Event Boss spawnen  
   - `/spawnboss super <anime> <boss>` - Super Boss spawnen

3. **Event-Bosse pro Anime:**
   - **One Piece:** Awakened Luffy, Blackbeard Rampage, Whitebeard Festival
   - **Naruto:** Naruto Nine-Tails, Sasuke Awakened, Kaguya Ōtsutsuki
   - **Bleach:** Aizen Final Form, Ichigo Hollow, Soul King Ceremony
   - **JJK:** Gojo Rampage, Toji Awakened, Kenjaku Convergence

## Setup-Schritte:

### 1. Datenbank Migratio
Führen Sie diese SQL in Ihrer Supabase aus:

```sql
-- Spalte is_event zu bosses Tabelle hinzufügen
ALTER TABLE bosses 
ADD COLUMN IF NOT EXISTS is_event boolean NOT NULL DEFAULT false;
```

### 2. Neue Boss-Daten seeden (optional)
Führen Sie den Seed-Befehl aus:
```bash
npm run seed
```

Oder führen Sie diese IDs in Supabase ein:
```sql
-- Event Bosse hinzufügen (beispiel für One Piece)
INSERT INTO bosses (boss_key, anime, display_name, is_super, is_event, hp_base, power_base)
VALUES 
  ('luffy_awakened', 'onepiece', 'Awakened Luffy (Event)', false, true, 52000, 750),
  ('blackbeard_event', 'onepiece', 'Blackbeard Rampage (Event)', false, true, 54000, 770),
  ('whitebeard_festival', 'onepiece', 'Whitebeard Festival (Event)', true, true, 130000, 1600)
ON CONFLICT (boss_key) DO NOTHING;

-- Gleich für andere Animes...
```

### 3. Bot neustarten
```bash
npm start
```

## Verwendung

Beispiele:

```
/spawnboss list
→ Zeigt alle Bosse nach Anime und Typ

/spawnboss normal naruto
→ Zeigt alle normalen Naruto Bosse zum Auswählen

/spawnboss event onepiece
→ Zeigt alle One Piece Event-Bosse

/spawnboss super jjk
→ Zeigt alle JJK Super-Bosse
```

## Datenbank-Schema

Die `bosses` Tabelle hat jetzt diese Spalten:
- `is_super` (boolean) - Super Boss (schwerer)
- `is_event` (boolean) - **NEU:** Event-spezifischer Boss

## Troubleshooting

**Problem:** Autocomplete zeigt keine Bosse
- Stelle sicher, dass die Migration gelaufen ist
- Überprüfe ob die seedData aktuell ist
- Wende den Seed an: `npm run seed`

**Problem:** "Unknown interaction" Fehler
- Das ist normal wenn die Autocomplete zu lange braucht
- Der Fehler sollte sich selbst beheben
