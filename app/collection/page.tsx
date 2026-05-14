"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameCard } from "@/components/GameCard";
import { PageHeader } from "@/components/PageHeader";
import type { Game } from "@/lib/types";

export default function CollectionPage() {
  const [games, setGames] = useState<Game[] | null>(null);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((j) => setGames(j.games));
  }, []);

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
      <PageHeader
        title="My Collection"
        subtitle={games ? `${games.length} game${games.length === 1 ? "" : "s"}` : ""}
      />
      <div className="flex justify-end mb-6">
        <Link
          href="/collection/add"
          className="btn-sticker active:btn-sticker-active bg-mint"
        >
          ➕ Add a game
        </Link>
      </div>
      {!games ? (
        <p className="text-center text-cocoa/60">Loading…</p>
      ) : games.length === 0 ? (
        <div className="text-center text-cocoa/60 py-16">
          <p className="text-2xl mb-2">🎲 No games yet</p>
          <p>Tap &ldquo;Add a game&rdquo; to start your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              onChange={(updated) =>
                setGames((prev) =>
                  prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev,
                )
              }
              onDelete={(id) =>
                setGames((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
