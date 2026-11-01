import { useMemo, useState } from "react";
import type { Recipe } from "@/data/recipes";

/** Searchable multi-select of existing recipes for the "Serve with" links. */
export function ServeWithPicker({
  value,
  onChange,
  recipes,
  selfId,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  recipes: Recipe[];
  selfId: string;
}) {
  const [query, setQuery] = useState("");
  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return recipes
      .filter((r) => r.id !== selfId && !value.includes(r.id))
      .filter((r) => r.title.toLowerCase().includes(q) || r.id.includes(q))
      .slice(0, 8);
  }, [query, recipes, value, selfId]);
  const linkedFrom = recipes.filter(
    (r) => selfId && r.id !== selfId && (r.serveWith ?? []).includes(selfId),
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((id) => (
          <span key={id} className="inline-flex items-center gap-2 px-3 py-1 text-xs border border-ink">
            {byId.get(id)?.title ?? id}
            {byId.get(id)?.status === "draft" && <span className="text-mute">(draft)</span>}
            <button
              type="button"
              aria-label={`Remove ${byId.get(id)?.title ?? id}`}
              onClick={() => onChange(value.filter((v) => v !== id))}
              className="text-mute hover:text-ink"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {value.length < 8 && (
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes to link…"
            className="w-full border border-steel bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 border border-steel bg-paper max-h-64 overflow-auto">
              {matches.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...value, r.id]);
                      setQuery("");
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary"
                  >
                    {r.title}
                    {r.status === "draft" && <span className="text-mute"> (draft)</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {linkedFrom.length > 0 && (
        <p className="text-xs text-mute">
          Also shown from: {linkedFrom.map((r) => r.title).join(", ")}
        </p>
      )}
    </div>
  );
}
