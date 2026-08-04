import type { Recipe } from "@/data/recipes";

export const SITE_URL = "https://vegancook.live";

/** ISO-ish week key: "2026-W07". Weeks start Monday, UTC. */
export function weekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Absolute week index since the epoch Monday — drives the rotation offset. */
export function weekIndex(date: Date = new Date()): number {
  const d = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  // 1970-01-05 was a Monday.
  return Math.floor((d - Date.UTC(1970, 0, 5)) / (7 * 86400000));
}

/** The Monday of the given week, as YYYY-MM-DD (UTC). */
export function weekStart(date: Date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministic weekly picks: walks the catalogue in a stable order, five at a
 * time, so no dish repeats until the whole collection has been through.
 */
export function pickWeeklyRecipes(
  recipes: Recipe[],
  date: Date = new Date(),
  count = 5,
): Recipe[] {
  const pool = [...recipes].sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return [];
  const take = Math.min(count, pool.length);
  const start = (weekIndex(date) * take) % pool.length;
  const picks: Recipe[] = [];
  for (let i = 0; i < take; i += 1) {
    picks.push(pool[(start + i) % pool.length]!);
  }
  return picks;
}
