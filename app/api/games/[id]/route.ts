import { NextResponse } from "next/server";
import { getDb, type GameRow, type GameStatus } from "@/lib/db";

type PatchBody = Partial<{
  title: string;
  image_url: string | null;
  min_players: number | null;
  max_players: number | null;
  playing_time: number | null;
  weight: number | null;
  status: GameStatus;
  new_dismissed: boolean;
}>;

const ALLOWED_STATUS: GameStatus[] = ["normal", "want_to_play"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const db = getDb();
  const body: PatchBody = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (typeof body.title === "string") {
    fields.push("title = ?");
    values.push(body.title);
  }
  if ("image_url" in body) {
    fields.push("image_url = ?");
    values.push(body.image_url);
  }
  if ("min_players" in body) {
    fields.push("min_players = ?");
    values.push(body.min_players);
  }
  if ("max_players" in body) {
    fields.push("max_players = ?");
    values.push(body.max_players);
  }
  if ("playing_time" in body) {
    fields.push("playing_time = ?");
    values.push(body.playing_time);
  }
  if ("weight" in body) {
    fields.push("weight = ?");
    values.push(body.weight);
  }
  if (body.status && ALLOWED_STATUS.includes(body.status)) {
    fields.push("status = ?");
    values.push(body.status);
  }
  if (typeof body.new_dismissed === "boolean") {
    fields.push("new_dismissed = ?");
    values.push(body.new_dismissed ? 1 : 0);
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }
  values.push(id);
  const result = db
    .prepare(`UPDATE games SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  if (result.changes === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const row = db.prepare(`SELECT * FROM games WHERE id = ?`).get(id) as GameRow;
  return NextResponse.json({ game: row });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  const db = getDb();
  const result = db.prepare(`DELETE FROM games WHERE id = ?`).run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
