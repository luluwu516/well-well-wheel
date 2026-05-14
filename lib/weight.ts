import type { GameRow } from "./db";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function isNewGame(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS;
}

export function defaultWeightFor(game: Pick<GameRow, "status" | "created_at">): number {
  if (isNewGame(game.created_at)) return 2;
  if (game.status === "want_to_play") return 1.5;
  return 1;
}

export const ALLOWED_WEIGHTS = [0.5, 1, 1.5, 2, 3] as const;
export type AllowedWeight = (typeof ALLOWED_WEIGHTS)[number];
