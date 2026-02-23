# SOULFLARES Boss + Raid PNG Naming

For the new 3-variant boss image system, use `READNAMEBOSS.md`.

This file lists the exact PNG filenames the bot can auto-load.

## 1) Boss Backgrounds

Put these files in:
`assets/backgrounds/boss/`

Boss-key priority (recommended):

```txt
<boss_key>.png
<boss_key>_easy.png
<boss_key>_hard.png
<boss_key>_nightmare.png
```

Current boss keys:

```txt
# One Piece
doflamingo.png
blackbeard.png
mihawk.png
shanks.png
whitebeard.png
imu.png

# Naruto
naruto.png
sasuke.png
itachi.png
obito.png
kaguya.png
madara.png

# Bleach
grimmjow.png
ulquiorra.png
kisuke.png
ichigo.png
yhwach.png
aizen.png

# JJK
toji.png
kashimo.png
hakari.png
sukuna.png
mahoraga.png
gojo_calamity.png
```

## 2) Boss Character PNGs

Put these files in:
`assets/backgrounds/boss/characters/`

Use exact `boss_key` filename (same list as above).

## 3) Raid Background PNGs

Put these files in:
`assets/backgrounds/raid/`

The bot checks in this order:

```txt
<raid_key>.png
<anime>_<raid_key>.png
<anime>.png
default.png
```

Current raid keys:

```txt
naruto_akatsuki.png
bleach_tybw_quincies.png
onepiece_onigashima.png
onepiece_admiral_fleet.png
onepiece_kaido.png
jjk_shibuya_train.png
```

## 4) Raid Stage Character PNGs (for your future uploads)

Put these files in:
`assets/backgrounds/raid/characters/`

```txt
# Naruto Akatsuki
itachi.png
kisame.png
obito.png
pain.png

# Bleach TYBW Quincies
bazz_b.png
as_nodt.png
jugram.png
yhwach.png

# One Piece Onigashima + Kaido Raid
kaido.png
big_mom.png
king.png
queen.png
jack.png
ulti.png

# One Piece Admiral Fleet Raid (updated)
garp.png
akainu.png
aokiji.png
sengoku.png
kizaru.png
fujitora.png

# JJK Shibuya Train Incident (updated)
kenjaku.png
hanami.png
dragon.png
choso.png
mahito.png
jogo.png
```

## 5) Important Notes

- File extension must be `.png`
- Filenames are lowercase and must match exactly
- No spaces in filenames
- If no file is found, bot uses fallback visuals/text
