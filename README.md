<div align="center">

# CITY Social Map — 《小城日常》交互式人物关系图

An interactive, trilingual (**中文 / EN / 日本語**) social relationship map for ***CITY THE ANIMATION*** (*Kyoto Animation*, 2025) & Keiichi Arawi's ***CITY***, built with React + TypeScript + Vite and deployed on **Cloudflare Workers Static Assets**.

**Live Site:** [https://social-map.city.chius.dev](https://social-map.city.chius.dev)

</div>

---

## Features

- **All 65 Residents with Portrait Avatars**: Every resident across the Classic Social Map, Ego Radar, Full Network, Character Dossier (with clickable portrait lightbox), Directory, Search, and Path Finder features a face-cropped WebP portrait avatar, authoritative Chinese/Japanese/English names, and verified 2025 anime voice cast (58 voiced CVs).
- **Dual Interactive Views — Classic Map + Ego Radar & Full Network**:
  - **全景图谱 / Classic Map**: Faithfully preserves VayItsHere's full 65-resident / 8-faction topology (including the **Makabe Family ∩ CITY South Soccer Team** overlap at Tatewaku and isolated John Lennon) with circular portrait medallions on every node.
  - **人物星图 / Ego Radar**: Character-centric radial star network placing any selected resident at the center with a 4-color C-I-T-Y aura ring, curved semantic category-colored links, directional arrowheads, optional 2nd-hop & same-faction outer ring (`+N`), free node dragging with layout reset, and 1-click re-centering on any neighbor.
  - **全城网络 / Full Network**: All 65 residents in a deterministic faction-clustered network where node size scales with connection degree, featuring 6-category relation filters (`Family`, `Friendship`, `Crush/Romance`, `Work`, `Rivalry`, `Mentor/Fans`), faction clouds, free node dragging, and **Isolate Subgraph** mode.
- **Categorized Comic Dossier Drawer**: Inspired by `city-the-animation.com`'s rotating 4-color conic frames and `#33333F` commentary bubbles — displays clickable portraits, authoritative names & CVs, one-click **"Open in Ego Radar"**, and relationships grouped by semantic category with connected avatars.
- **Spoiler-Free Mode (无剧透模式)**: One-click toggle that masks late-series identity reveals (e.g., *Nichijou* crossover, Quiz King, Kamui Tateshina, Onigawara, Gondenyama) across maps, dossiers, search, and directory.
- **Six Degrees of CITY (Path Finder)**: Discover the shortest relationship chain between any two residents with avatar breadcrumb trails (complete with the *John Lennon* isolation Easter egg!).
- **Shareable Deep Links**: Link directly to any character or view mode via URL hash (e.g. `#char=wako`, `#mode=network&char=nagumo`, `#mode=network&sub=full`).

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
