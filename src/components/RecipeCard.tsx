import { Link } from "@tanstack/react-router";
import { formatTime, type Recipe } from "@/data/recipes";

/** Shared collection card — used on the home page and the full recipes archive. */
export function RecipeCard({ recipe: r }: { recipe: Recipe }) {
  return (
    <li className="bg-paper">
      <Link
        to="/recipes/$id"
        params={{ id: r.id }}
        className="p-6 h-full flex flex-col gap-4 group hover:bg-secondary transition-colors"
      >
        {r.imageUrl && (
          <img
            src={r.imageUrl}
            alt={r.imageAlt || r.title}
            loading="lazy"
            className="w-full aspect-[3/2] object-cover border border-steel"
          />
        )}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl leading-tight tracking-tight text-balance group-hover:text-leaf transition-colors">
            {r.title}
          </h3>
          <span className="text-[9px] uppercase tracking-[0.1em] text-mute shrink-0 mt-1">
            {r.skill}
          </span>
        </div>
        <p className="text-xs text-mute leading-relaxed line-clamp-3">{r.blurb}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-mute">
          {r.cuisine && <span>{r.cuisine}</span>}
          {r.spiceLevel && <span>{r.spiceLevel} spice</span>}
          {r.mealTypes.length > 0 && <span>{r.mealTypes.join(" / ")}</span>}
          {r.calories != null && <span className="tabular-nums">{r.calories} kcal</span>}
        </div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-mute mt-auto pt-4 border-t border-steel">
          <span className="tabular-nums">{formatTime(r.timeMinutes)}</span>
          <span>
            {r.contains.length === 0
              ? "No declared allergens"
              : `Contains ${r.contains.join(", ")}`}
          </span>
        </div>
      </Link>
    </li>
  );
}
