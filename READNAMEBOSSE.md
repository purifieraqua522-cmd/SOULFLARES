# SOULFLARES Boss PNG Naming

This file lists the exact PNG filenames the bot can auto-load.

## 1) Boss Backgrounds

Put these files in:
`assets/backgrounds/boss/`

Recommended full set (per anime + difficulty):

```txt
onepiece_easy.png
onepiece_hard.png
onepiece_nightmare.png

naruto_easy.png
naruto_hard.png
naruto_nightmare.png

bleach_easy.png
bleach_hard.png
bleach_nightmare.png

jjk_easy.png
jjk_hard.png
jjk_nightmare.png
```

Optional global fallbacks:

```txt
easy.png
hard.png
nightmare.png
default.png
```

Optional defeated variants:

```txt
onepiece_easy_defeated.png
onepiece_hard_defeated.png
onepiece_nightmare_defeated.png

naruto_easy_defeated.png
naruto_hard_defeated.png
naruto_nightmare_defeated.png

bleach_easy_defeated.png
bleach_hard_defeated.png
bleach_nightmare_defeated.png

jjk_easy_defeated.png
jjk_hard_defeated.png
jjk_nightmare_defeated.png

easy_defeated.png
hard_defeated.png
nightmare_defeated.png
default_defeated.png
```

## 2) Boss Character PNGs

Put these files in:
`assets/backgrounds/boss/characters/`

Use exact `boss_key` filename:

```txt
kizaru.png
mihawk.png
aokiji.png
kaido.png
luffy_awakened.png
blackbeard_event.png
whitebeard_festival.png

itachi.png
pain.png
kisame.png
madara.png
naruto_nine_tails.png
sasuke_awakened.png
otsutsuki_kaguya.png

ulquiorra.png
grimmjow.png
byakuya.png
yhwach.png
aizen_final.png
ichigo_hollow.png
soul_king_event.png

jogo.png
mahito.png
hanami.png
sukuna_true.png
gojo_rampage.png
toji_awakened.png
kenjaku_convergence.png
```

## 3) Optional Card Asset Fallbacks

The renderer also checks:

`assets/cards/<anime>/<boss_key>.png`

Example:

```txt
assets/cards/onepiece/kaido.png
assets/cards/naruto/madara.png
assets/cards/bleach/yhwach.png
assets/cards/jjk/sukuna_true.png
```

## 4) Important Notes

- File extension must be `.png`
- Filenames are lowercase and must match exactly
- No spaces in filenames
- If no file is found, bot uses gradient fallback
