import { NextResponse } from "next/server";
import { fetchGameDetail } from "@/lib/bgg";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idStr = url.searchParams.get("id");
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    const detail = await fetchGameDetail(id);
    return NextResponse.json({ detail });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
