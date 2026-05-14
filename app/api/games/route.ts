import { NextResponse } from "next/server";
import { getDb, type GameRow } from "@/lib/db";
import { isNewGame } from "@/lib/weight";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM games ORDER BY created_at DESC`)
    .all() as GameRow[];
  const games = rows.map((r) => ({ ...r, is_new: isNewGame(r.created_at) }));
  return NextResponse.json({ games });
}

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();
  const { id, title, image_url, min_players, max_players, playing_time, weight } =
    body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (id != null && typeof id !== "number") {
    return NextResponse.json({ error: "id must be a number" }, { status: 400 });
  }

  // BGG entries keep their positive BGG ID; manual entries get a negative ID
  // so they never collide with a future BGG import.
  let finalId: number;
  if (typeof id === "number") {
    const existing = db.prepare(`SELECT id FROM games WHERE id = ?`).get(id);
    if (existing) {
      return NextResponse.json({ error: "already in collection" }, { status: 409 });
    }
    finalId = id;
  } else {
    const row = db.prepare(`SELECT MIN(id) AS m FROM games`).get() as {
      m: number | null;
    };
    finalId = row.m == null || row.m >= 0 ? -1 : row.m - 1;
  }

  db.prepare(
    `INSERT INTO games (id, title, image_url, min_players, max_players, playing_time, weight)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    finalId,
    title.trim(),
    image_url ?? null,
    min_players ?? null,
    max_players ?? null,
    playing_time ?? null,
    weight ?? null,
  );
  const game = db
    .prepare(`SELECT * FROM games WHERE id = ?`)
    .get(finalId) as GameRow;
  return NextResponse.json({ game }, { status: 201 });
}
