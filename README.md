<div align="center">

# CITY Social Map — 《小城日常》交互式人物关系图

An interactive, trilingual (**中文 / EN / 日本語**) social relationship map for ***CITY THE ANIMATION*** (*Kyoto Animation*, 2025) & Keiichi Arawi's ***CITY***, built with React + TypeScript + Vite and deployed on **Cloudflare Workers Static Assets**.

</div>

---

## Features

- **Faithful Full-Cast Social Map**: Covers all **65 residents**, **8 factions** (including the authentic **Makabe Family ∩ CITY South Soccer Team** overlap at Tatewaku Makabe), and every relationship line (**Children**, **Friendship**, **Employment**, and **Specific** relations) from VayItsHere's community Social Map.
- **Official Site Aesthetic**: Inspired by [`city-the-animation.com`](https://city-the-animation.com/) — featuring the 4-color C-I-T-Y palette (`#F7B647` / `#F09CB4` / `#99CB77` / `#EE847D`), scrolling pastel confetti background, rotating 4-color conic frames, morphing 4-stripe menu icon, rounded comic ink borders, and bottom-right resident finder + stacked pill zoom controls.
- **Smooth Pan, Zoom & Spotlight**: Drag to pan, wheel/pinch to zoom toward cursor, hover any resident or relationship line to spotlight connections and read humorous canon context, or click to open a complete character/faction dossier drawer with voice actors (CV), official catchphrases, and Wiki links.
- **Six Degrees of CITY (Path Finder)**: Discover the shortest relationship chain between any two residents (complete with the *John Lennon* isolation Easter egg!).
- **Resident Directory & Instant Search**: Search by Chinese, Japanese, English, Romaji, voice actor (CV), faction, or soccer jersey number (`#1`–`#28`), and fly directly to any resident on the map.
- **Shareable Deep Links**: Link directly to any character via URL hash (e.g. `#char=nagumo`, `#char=tatewaku`).

## Development

```bash
npm install
npm run dev
```

## Build & Deploy to Cloudflare Workers

This project uses [`@cloudflare/vite-plugin`](https://developers.cloudflare.com/workers/vite-plugin/) and **Workers Static Assets** (`wrangler.jsonc` with `not_found_handling: "single-page-application"`).

```bash
# 1. Authenticate with Cloudflare
npx wrangler login

# 2. Type-check, build, and deploy
npm run deploy
```

### Automatic CI/CD with GitHub Actions

This repository includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) powered by `cloudflare/wrangler-action@v4`:

- **Push to `main` (or manual trigger)**: runs `npm ci`, `npm run build`, and deploys automatically to Cloudflare Workers.
- **Pull requests to `main`**: runs type-check, build, and `wrangler deploy --dry-run` without touching production.

Configure the following Repository Secrets in GitHub (**Settings → Secrets and variables → Actions**):

1. `CLOUDFLARE_API_TOKEN` (**required**): Create a token in the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/api-tokens) using the **Edit Cloudflare Workers** template, scoped to your target account.
2. `CLOUDFLARE_ACCOUNT_ID` (**recommended**, required if your token has access to multiple accounts): Your Cloudflare Account ID from the dashboard URL or Workers overview sidebar.

You can also connect this repository directly to **Cloudflare Workers Builds** in the Cloudflare Dashboard:
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`

## Credits & Sources

- **Original Social Map**: [File:CITY Social Map by VayItsHere.jpeg](https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg) by **VayItsHere / Mokkachino (Discord)** (June 28, 2025) on [CITY Wiki](https://city.wiki.gg/).
- **Curated Resources**: [chius-me/awesome-citytheanimation](https://github.com/chius-me/awesome-citytheanimation).
- **Visual Style Reference**: [*CITY THE ANIMATION* Official Website](https://city-the-animation.com/).
- **Original Work**: *CITY* © Keiichi Arawi · Kodansha / *CITY THE ANIMATION* Production Committee (Kyoto Animation).
