import { NextResponse } from "next/server";
import { searchGames } from "@/lib/bgg";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ hits: [] });
  try {
    const hits = await searchGames(q);
    return NextResponse.json({ hits });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
