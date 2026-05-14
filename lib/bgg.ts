import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["item", "name", "link"].includes(name),
});

// TODO: BGG started gating xmlapi2 behind auth in late 2025. Migrate to the
// authenticated API2 (with the new /thing endpoint) once credentials arrive.
const BGG = "https://boardgamegeek.com/xmlapi2";

async function fetchXml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { Accept: "application/xml" } });
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    if (!res.ok) throw new Error(`BGG ${res.status}: ${url}`);
    return res.text();
  }
  throw new Error("BGG took too long to respond");
}

export type BggSearchHit = {
  id: number;
  title: string;
  year: number | null;
};

export async function searchGames(query: string): Promise<BggSearchHit[]> {
  if (!query.trim()) return [];
  const url = `${BGG}/search?query=${encodeURIComponent(query)}&type=boardgame`;
  const xml = await fetchXml(url);
  const json = parser.parse(xml);
  const items = json?.items?.item ?? [];
  return items.slice(0, 20).map((it: BggItem) => ({
    id: Number(it["@_id"]),
    title: pickPrimaryName(it.name) ?? "(unknown)",
    year: it.yearpublished?.["@_value"] ? Number(it.yearpublished["@_value"]) : null,
  }));
}

export type BggGameDetail = {
  id: number;
  title: string;
  image_url: string | null;
  min_players: number | null;
  max_players: number | null;
  playing_time: number | null;
  weight: number | null;
};

export async function fetchGameDetail(id: number): Promise<BggGameDetail> {
  const url = `${BGG}/thing?id=${id}&stats=1`;
  const xml = await fetchXml(url);
  const json = parser.parse(xml);
  const it = json?.items?.item?.[0];
  if (!it) throw new Error(`BGG returned no item for id=${id}`);
  const weightRaw = it?.statistics?.ratings?.averageweight?.["@_value"];
  return {
    id,
    title: pickPrimaryName(it.name) ?? "(unknown)",
    image_url: typeof it.image === "string" ? it.image : null,
    min_players: it.minplayers?.["@_value"] ? Number(it.minplayers["@_value"]) : null,
    max_players: it.maxplayers?.["@_value"] ? Number(it.maxplayers["@_value"]) : null,
    playing_time: it.playingtime?.["@_value"] ? Number(it.playingtime["@_value"]) : null,
    weight: weightRaw ? Number(weightRaw) : null,
  };
}

// ---- helpers / minimal types ----

type BggNameEntry = { "@_type"?: string; "@_value"?: string };
type BggValue = { "@_value"?: string };
type BggItem = {
  "@_id": string;
  name?: BggNameEntry[];
  yearpublished?: BggValue;
  image?: string;
  minplayers?: BggValue;
  maxplayers?: BggValue;
  playingtime?: BggValue;
  statistics?: { ratings?: { averageweight?: BggValue } };
};

function pickPrimaryName(names: BggNameEntry[] | undefined): string | null {
  if (!names || names.length === 0) return null;
  const primary = names.find((n) => n["@_type"] === "primary");
  return (primary ?? names[0])["@_value"] ?? null;
}
