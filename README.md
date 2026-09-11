# September 12th — A Toy World

[![Play](https://img.shields.io/badge/play-darkkowalski.github.io-a8321f?logo=githubpages&logoColor=white)](https://darkkowalski.github.io/sep12-game-remake/)
[![CI](https://github.com/DarkKowalski/sep12-game-remake/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkKowalski/sep12-game-remake/actions/workflows/ci.yml)

**Play it: <https://darkkowalski.github.io/sep12-game-remake/>**

A remake of *September 12th: A Toy World*, the 2003 newsgame by **Gonzalo Frasca**, published by **Newsgaming.com**

> This is not a game. You can't win and you can't lose.
> This is a simulation. It has no ending. It has already begun.
> The rules are deadly simple. You can shoot. Or not.

This is an unofficial homage. No affiliation with the original authors is claimed.

## The argument is in the rules

There is no score, no timer and no objective, because adding any of them would turn a
simulation into a game with a win condition. What the game has instead is three numbers
in `src/sim/config.ts`:

- A missile takes **two seconds** to land. Whoever you aimed at has walked on by then.
- The blast radius is **wider than the gap between people**. You do not choose who dies.
- Every civilian who kneels to grieve over a body **stands back up as a terrorist**.

Shooting at terrorists reliably produces more of them. Doing nothing is the only stable
state. Loosen any of those three numbers and the game stops saying anything.

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:5173, also served on the LAN for phone testing
pnpm test         # simulation unit tests
pnpm typecheck
pnpm build        # static output in dist/
pnpm preview
```

## Controls

| | |
|---|---|
| Desktop | Move to aim, click to fire |
| Touch | Press and drag to aim, lift to fire. Release outside the town to cancel |

## Translation

| | | |
|---|---|---|
| `en` | English | English |
| `zh-CN` | 简体中文 | Simplified Chinese |
| `zh-HK` | 繁體中文 | Traditional Chinese |
| `ja-JP` | 日本語 | Japanese |
| `ko-KR` | 한국어 | Korean |
| `fr-FR` | Français | French |
| `de-DE` | Deutsch | German |
| `nl-NL` | Nederlands | Dutch |
| `es-ES` | Español | Spanish |
| `it-IT` | Italiano | Italian |
| `pt-BR` | Português | Portuguese (Brazil) |
| `pl-PL` | Polski | Polish |
| `ru-RU` | Русский | Russian |
| `tr-TR` | Türkçe | Turkish |
| `id-ID` | Bahasa Indonesia | Indonesian |
| `ar-EG` | العربية | Arabic |
| `he-IL` | עברית | Hebrew |
| `fa-IR` | فارسی | Persian |
| `ur-PK` | اردو | Urdu |

More welcome. Copy `src/i18n/locales/en.ts`, translate the values, add it to `LOCALES` in
`src/i18n/index.ts`. `pnpm typecheck` will tell you if you missed a key.

## Credits

Original game design and text: **Gonzalo Frasca**, Newsgaming.com, 2003.
