# READNAMEBOSS - 3 Image Variants per Boss

Use this naming so the bot auto-loads your boss images.

## Boss Background Folder

Put files here:
`assets/backgrounds/boss/`

### Supported naming (priority)

```txt
<boss_key>_<difficulty>_1.png
<boss_key>_<difficulty>_2.png
<boss_key>_<difficulty>_3.png
<boss_key>_1.png
<boss_key>_2.png
<boss_key>_3.png
<boss_key>_<difficulty>.png
<boss_key>.png

<anime>_<difficulty>_1.png
<anime>_<difficulty>_2.png
<anime>_<difficulty>_3.png
<anime>_<difficulty>.png
<anime>_1.png
<anime>_2.png
<anime>_3.png
<anime>.png

default.png
```

For defeated state (optional):

```txt
<boss_key>_1_defeated.png
<boss_key>_2_defeated.png
<boss_key>_3_defeated.png
<boss_key>_defeated.png
<anime>_defeated.png
default_defeated.png
```

## Boss Character Folder

Put files here:
`assets/backgrounds/boss/characters/`

### Supported naming (priority)

```txt
<boss_key>_1.png
<boss_key>_2.png
<boss_key>_3.png
<boss_key>.png
<anime>_<boss_key>_1.png
<anime>_<boss_key>_2.png
<anime>_<boss_key>_3.png
<anime>_<boss_key>.png
```

### Optional fallback via card assets

```txt
assets/cards/<anime>/<boss_key>_1.png
assets/cards/<anime>/<boss_key>_2.png
assets/cards/<anime>/<boss_key>_3.png
assets/cards/<anime>/<boss_key>.png
```

## Example (Sasuke with 3 images)

```txt
assets/backgrounds/boss/sasuke_1.png
assets/backgrounds/boss/sasuke_2.png
assets/backgrounds/boss/sasuke_3.png

assets/backgrounds/boss/characters/sasuke_1.png
assets/backgrounds/boss/characters/sasuke_2.png
assets/backgrounds/boss/characters/sasuke_3.png
```

## Current Boss Keys

```txt
# One Piece
doflamingo
blackbeard
mihawk
shanks
whitebeard
imu

# Naruto
naruto
sasuke
itachi
obito
kaguya
madara

# Bleach
grimmjow
ulquiorra
kisuke
ichigo
yhwach
aizen

# JJK
toji
kashimo
hakari
sukuna
mahoraga
gojo_calamity
```

## Notes

- File extension must be `.png`
- Use lowercase names
- No spaces in filenames
- When multiple variants exist (`_1/_2/_3`), the bot picks one automatically