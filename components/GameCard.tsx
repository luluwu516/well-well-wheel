"use client";

import { useState } from "react";
import { GameCover } from "./GameCover";
import { StatusBadge } from "./StatusBadge";
import type { Game } from "@/lib/types";

type Props = {
  game: Game;
  onChange: (next: Game) => void;
  onDelete: (id: number) => void;
};

export function GameCard({ game, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function dismissNew() {
    setBusy(true);
    const res = await fetch(`/api/games/${game.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_dismissed: true }),
    });
    if (res.ok) {
      const { game: updated } = await res.json();
      onChange({ ...updated, is_new: false });
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Delete "${game.title}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/games/${game.id}`, { method: "DELETE" });
    if (res.ok) onDelete(game.id);
    setBusy(false);
  }

  return (
    <div className="card-sticker overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square bg-cream overflow-hidden">
        <GameCover
          src={game.image_url}
          alt={game.title}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <StatusBadge game={game} onDismissNew={dismissNew} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold leading-tight line-clamp-2">{game.title}</h3>
        <div className="text-xs text-cocoa/70 flex flex-wrap gap-x-3 gap-y-1">
          <span>👥 {game.min_players ?? "?"}–{game.max_players ?? "?"}</span>
          <span>⏱ {game.playing_time ?? "?"}m</span>
          {game.weight != null && <span>🧠 {game.weight.toFixed(1)}</span>}
        </div>
        <div className="flex gap-1 mt-auto flex-wrap">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-xs btn-sticker active:btn-sticker-active px-3 py-1 bg-mint"
          >
            {editing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-xs btn-sticker active:btn-sticker-active px-3 py-1 bg-berry"
          >
            Delete
          </button>
        </div>
        {editing && (
          <EditForm
            game={game}
            onSaved={(updated) => {
              onChange({ ...updated, is_new: game.is_new });
              setEditing(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function EditForm({
  game,
  onSaved,
}: {
  game: Game;
  onSaved: (g: Game) => void;
}) {
  const [title, setTitle] = useState(game.title);
  const [imageUrl, setImageUrl] = useState(game.image_url ?? "");
  const [minP, setMinP] = useState(game.min_players ?? 1);
  const [maxP, setMaxP] = useState(game.max_players ?? 4);
  const [time, setTime] = useState(game.playing_time ?? 30);
  const [weight, setWeight] = useState(
    game.weight != null ? String(game.weight) : "",
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/games/${game.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        image_url: imageUrl.trim() || null,
        min_players: Number(minP),
        max_players: Number(maxP),
        playing_time: Number(time),
        weight: weight.trim() === "" ? null : Number(weight),
      }),
    });
    if (res.ok) {
      const { game: updated } = await res.json();
      onSaved(updated);
    }
    setSaving(false);
  }

  const inputClass = "rounded-lg border-2 border-cocoa/40 px-2 py-1 bg-white";

  return (
    <div className="mt-2 p-2 rounded-xl bg-cream/60 border-2 border-cocoa/30 flex flex-col gap-2 text-xs">
      <label className="flex flex-col gap-1">
        <span className="font-bold">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          autoComplete="off"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-bold">Image URL</span>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
          autoComplete="off"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="font-bold">Min</span>
          <input
            type="number"
            min={1}
            value={minP}
            onChange={(e) => setMinP(Number(e.target.value))}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Max</span>
          <input
            type="number"
            min={1}
            value={maxP}
            onChange={(e) => setMaxP(Number(e.target.value))}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Time (m)</span>
          <input
            type="number"
            min={1}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Weight</span>
          <input
            type="number"
            step={0.1}
            min={1}
            max={5}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-sticker active:btn-sticker-active bg-tangerine self-start text-xs"
      >
        Save
      </button>
    </div>
  );
}
