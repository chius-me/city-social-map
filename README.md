<div align="right">English | <a href="./README.zh.md">简体中文</a></div>

<div align="center">

<img src="./public/favicon.svg" width="56" height="56" alt="CITY Social Map">

# CITY Social Map

Interactive character relationship map & ego-network explorer for ***CITY THE ANIMATION*** (*Kyoto Animation*, 2025).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/chius-me/city-social-map/actions/workflows/deploy.yml/badge.svg)](https://github.com/chius-me/city-social-map/actions/workflows/deploy.yml)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)

[Live Demo](https://social-map.city.chius.dev) · [Ego Radar](https://social-map.city.chius.dev/#mode=network&char=nagumo) · [Issues](https://github.com/chius-me/city-social-map/issues) · [Awesome CITY](https://github.com/chius-me/awesome-citytheanimation)

</div>

> "This town is not just a normal town. There's laughter, love, and emotional moments."
>
> 65 Residents · 8 Factions · 65 Relationship Edges · 中文 / EN / 日本語

![Classic Social Map](./docs/screenshot-map.webp)

![Character Ego Radar & Dossier](./docs/screenshot-ego.webp)

## Highlights

- **Dual Interactive Views**:
  - **Classic Map**: Faithfully preserves VayItsHere's full 65-resident, 8-faction topology (including the **Makabe Family ∩ CITY South Soccer Team** overlap at Tatewaku Makabe and isolated John Lennon) with circular portrait medallions on every node.
  - **Ego Radar & Full Network**: Switch to a character-centric radial radar with rotating C-I-T-Y rings, curved directional links, optional 2nd-degree & same-faction outer rings (`+N`), free node dragging with layout reset, 6-category semantic filters, and **Isolate Subgraph** mode where node size reflects connection degree.
- **All 65 Residents with Portrait Avatars**: Face-cropped `.webp` portraits (`public/avatars/`) across Classic Map nodes, Ego Radar / Full Network nodes, Dossier drawers (with clickable lightbox), Resident Directory, instant search autocomplete, and Path Finder trails, paired with 58 voiced 2025 anime cast credits.
- **Categorized Comic Dossiers**: Rotating 4-color `conic-gradient` cards and `#33333F` commentary bubbles displaying bios, cast CVs, one-click **Open in Ego Radar**, and relationships grouped by **Family**, **Friendship**, **Crush / Romance**, **Work & Ties**, **Rivalry & Chaos**, and **Mentor & Fans**.
- **Six Degrees of CITY (Path Finder)**: BFS shortest-path finder between any two residents with avatar breadcrumb trails (plus the *John Lennon* isolation Easter egg).
- **Spoiler-Free Mode**: One-click toggle in the top shelf and menu overlay that masks late-series identity reveals (*Nichijou* crossover, Quiz King, Kamui Tateshina, Onigawara, Gondenyama) across maps, dossiers, directory, and search.
- **Official Aesthetic & Trilingual Support**: Inspired directly by [`city-the-animation.com`](https://city-the-animation.com/) with instant **中文 / EN / 日本語** switching.

## Deep Links

| View / Target | URL | Description |
| --- | --- | --- |
| Classic Social Map | [`/`](https://social-map.city.chius.dev/) | Full 65-resident topology overview with relationship layer filters |
| Character Dossier | [`/#char=wako`](https://social-map.city.chius.dev/#char=wako) | Flies directly to Wako Izumi and opens her portrait dossier |
| Ego Radar | [`/#mode=network&char=nagumo`](https://social-map.city.chius.dev/#mode=network&char=nagumo) | Centers the interactive star radar on Midori Nagumo |
| Full Network | [`/#mode=network&sub=full`](https://social-map.city.chius.dev/#mode=network&sub=full) | Displays all 65 residents in a degree-sized, faction-clustered network |

## Project Structure

```text
city-social-map/
├── public/
│   ├── avatars/                      # 65 cropped WebP resident portraits
│   └── favicon.svg                   # 4-color C-I-T-Y emblem
├── src/
│   ├── components/
│   │   ├── CharacterNetworkCanvas.tsx # Ego Radar & Full Network SVG canvas
│   │   ├── SocialMapCanvas.tsx       # Classic Social Map pan/zoom canvas
│   │   ├── DetailDrawer.tsx          # Conic-frame portrait dossier & grouped ties
│   │   ├── DirectoryModal.tsx        # Filterable 65-resident directory
│   │   ├── PathFinderBar.tsx         # Six Degrees of CITY path finder
│   │   ├── TopBar.tsx                # Official-style shelf, mode & spoiler toggles
│   │   ├── BottomControls.tsx        # Quick resident stepper, search & zoom pills
│   │   └── MenuOverlay.tsx           # Full-screen navigation & resource hub
│   ├── data/                         # Characters, factions, edges, i18n & links
│   ├── styles/                       # Official-inspired C-I-T-Y theme tokens & CSS
│   └── utils/                        # BFS pathfinding & spoiler-safe helpers
├── wrangler.jsonc                    # Cloudflare Workers Static Assets config
└── .github/workflows/deploy.yml      # CI check & automated Cloudflare deploy
```

## Local Development

Node.js 22+ is required.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # TypeScript check + production build (dist/)
npm run preview  # Preview the production bundle locally
```

## Deploy

Hosted on **Cloudflare Workers Static Assets** at [social-map.city.chius.dev](https://social-map.city.chius.dev) (`wrangler.jsonc` with `not_found_handling: "single-page-application"`).

Pushes to `main` automatically build and deploy via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pull requests run `npm run build` and `npx wrangler deploy --dry-run` checks.

Repository secrets for GitHub Actions:

1. `CLOUDFLARE_API_TOKEN` (**required**): Cloudflare API token using the **Edit Cloudflare Workers** template.
2. `CLOUDFLARE_ACCOUNT_ID` (**recommended**): Target Cloudflare Account ID.

To deploy locally:

```bash
npx wrangler login
npm run deploy
```

## Credits & Sources

- **Original Map Topology**: [File:CITY Social Map by VayItsHere.jpeg](https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg) by **VayItsHere / Mokkachino (Discord)** (June 28, 2025) on [CITY Wiki](https://city.wiki.gg/).
- **Curated Resources**: [`chius-me/awesome-citytheanimation`](https://github.com/chius-me/awesome-citytheanimation).
- **Visual Style Reference**: [*CITY THE ANIMATION* Official Website](https://city-the-animation.com/).
- **Cast & Localization References**: Official anime credits, [Bangumi](https://bgm.tv/subject/514358), [AniList](https://anilist.co/anime/181841/CITY-THE-ANIMATION), and [Moegirlpedia](https://zh.moegirl.org.cn/CITY).

## 📄 License

Software source code in this repository is distributed under the [MIT License](LICENSE).

Unofficial fan-made interactive tribute. Original *CITY* characters, anime portraits, and intellectual property belong to © Keiichi Arawi · Kodansha / *CITY THE ANIMATION* Production Committee (Kyoto Animation).

---

<div align="center">
  <sub>Crafted with ❤️ by <a href="https://chius.cc">Chius</a> · Powered by Cloudflare & GitHub</sub>
</div>
