import type { GameRow } from "./db";

export type Game = GameRow & { is_new: boolean };
