# Well Well Wheel 🎡

Can't decide tonight? A local-first picker for your board game shelf:
manage a collection (manual or BoardGameGeek auto-fill), filter by player
count and time available, weight the candidates, and spin a roulette
wheel for the verdict.

Built with Next.js 16 + better-sqlite3. Runs entirely on your laptop.

## Quick start

**Prereqs:** Node.js 20+ (`node --version` to check).

```bash
git clone <this repo>
cd well-well-wheel
npm install
npm run dev
```

Open <http://localhost:3000>. Done.

## BoardGameGeek auto-fill (optional)

Since late 2025 BGG's XML API requires an auth token. The app still
runs fine without one — you just won't get the search-and-auto-fill on
the Add page; type details by hand instead.

To enable auto-fill, get your own token from BoardGameGeek and put it in
a `.env.local` file at the project root:

```
BGG_API_TOKEN=your-token-here
```

`.env.local` is gitignored so the token stays on your machine. Restart
`npm run dev` after creating or changing it.

> **Note:** Don't share someone else's token — usage counts against
> their BGG account and any rate-limit penalties stick to them. Each
> person running this app should have their own.

## Where is my data?

Everything lives in `data/wellwheel.db` (SQLite, auto-created on first
run). The entire `data/` folder is gitignored.

- **Backup:** copy the whole `data/` directory (the `.db`, `.db-wal`,
  and `.db-shm` files together).
- **Reset:** `rm -rf data/` and restart — you get a fresh empty DB.
- **Inspect:** `sqlite3 data/wellwheel.db "SELECT * FROM games;"` or
  open it with [DB Browser for SQLite](https://sqlitebrowser.org/).

Each person running the app gets their own private collection on their
own machine — there is no shared backend.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload at :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
