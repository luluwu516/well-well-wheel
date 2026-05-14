import type { Game } from "@/lib/types";

export function StatusBadge({ game }: { game: Game }) {
  if (game.is_new) {
    return (
      <span className="rounded-full bg-tangerine border-2 border-cocoa px-2 py-0.5 text-xs font-bold">
        ✨ NEW
      </span>
    );
  }
  if (game.status === "want_to_play") {
    return (
      <span className="rounded-full bg-lavender border-2 border-cocoa px-2 py-0.5 text-xs font-bold">
        💜 WANT
      </span>
    );
  }
  return null;
}
