import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

declare global {
  var __wellWheelDb: Database.Database | undefined;
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "wellwheel.db");

function open(): Database.Database {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const conn = new Database(dbPath);
  conn.pragma("journal_mode = WAL");
  conn.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT,
      min_players INTEGER,
      max_players INTEGER,
      playing_time INTEGER,
      weight REAL,
      status TEXT NOT NULL DEFAULT 'normal',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Migration: optional dismissal flag for the auto-derived NEW badge.
  // ALTER fails the second time around; swallow the duplicate-column error.
  try {
    conn.exec(`ALTER TABLE games ADD COLUMN new_dismissed INTEGER NOT NULL DEFAULT 0`);
  } catch (e) {
    if (!(e as Error).message.includes("duplicate column")) throw e;
  }
  return conn;
}

export function getDb(): Database.Database {
  if (!global.__wellWheelDb) global.__wellWheelDb = open();
  return global.__wellWheelDb;
}

export type GameStatus = "normal" | "want_to_play";

export type GameRow = {
  id: number;
  title: string;
  image_url: string | null;
  min_players: number | null;
  max_players: number | null;
  playing_time: number | null;
  weight: number | null;
  status: GameStatus;
  new_dismissed: number; // 0 | 1, sqlite has no bool
  created_at: string;
};
