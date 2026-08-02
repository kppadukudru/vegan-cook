import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { listPublishedPosts } from "@/lib/journal.functions";
import {
  ALL_JOURNAL_TAGS,
  formatPostDate,
  readingMinutes,
  type JournalPost,
  type JournalTag,
} from "@/lib/journal";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Journal — Notes on Eating Vegan, at Home and Away" },
      {
        name: "description",
        content:
          "Travel notes, allergy guides and thoughts on plant-based eating — ordering vegan in Italy and India, and how the milk alternatives really compare.",
      },
      { property: "og:title", content: "Journal — Notes on Eating Vegan, at Home and Away" },
      {
        property: "og:description",
        content: "Travel notes, allergy guides and thoughts on plant-based eating.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vegancook.live/journal" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.vegancook.live/journal" }],
  }),
  loader: () => listPublishedPosts(),
  errorComponent: () => (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="font-serif text-3xl tracking-tight">The journal is briefly closed</h1>
        <p className="text-sm text-mute">We couldn't load the posts just now. Please refresh.</p>
      </div>
    </div>
  ),
  component: JournalIndex,
});

function JournalIndex() {
  const posts = Route.useLoaderData() as JournalPost[];
  const [tag, setTag] = useState<JournalTag | "All">("All");

  const filtered = useMemo(
    () => (tag === "All" ? posts : posts.filter((p) => p.tag === tag)),
    [posts, tag],
  );

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">Journal</p>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              Notes on eating plant-based — where I've travelled, and what I've had to work around.
            </h1>
            <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
              Longer pieces that don't fit into a recipe card: how to order in a city that doesn't
              expect you, what a dairy allergy actually rules out, and which alternatives are worth
              the shelf space.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.15em] text-mute border-b border-steel pb-2 block w-full">
              Topics
            </span>
            <div className="flex flex-wrap gap-2">
              {(["All", ...ALL_JOURNAL_TAGS] as (JournalTag | "All")[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  aria-pressed={tag === t}
                  className={`px-4 py-2 text-xs transition-colors ${
                    tag === t
                      ? "border border-ink bg-ink text-paper"
                      : "border border-steel text-mute hover:border-ink hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-mute">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </p>
        </div>

        <div className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-steel p-12 text-center text-sm text-mute">
              Nothing published under that topic yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-steel border border-steel">
              {filtered.map((p) => (
                <li key={p.id} className="bg-paper">
                  <Link
                    to="/journal/$slug"
                    params={{ slug: p.id }}
                    className="p-6 h-full flex flex-col gap-4 group hover:bg-secondary transition-colors"
                  >
                    {p.coverUrl && (
                      <img
                        src={p.coverUrl}
                        alt={p.coverAlt || p.title}
                        loading="lazy"
                        className="w-full aspect-[3/2] object-cover border border-steel"
                      />
                    )}
                    <div className="flex items-center justify-between gap-4 text-[9px] uppercase tracking-[0.1em] text-mute">
                      <span>{p.tag}</span>
                      <span className="tabular-nums">{formatPostDate(p.publishedAt)}</span>
                    </div>
                    <h2 className="font-serif text-xl leading-tight tracking-tight text-balance group-hover:text-leaf transition-colors">
                      {p.title}
                    </h2>
                    <p className="text-xs text-mute leading-relaxed line-clamp-4">{p.excerpt}</p>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-mute mt-auto pt-4 border-t border-steel">
                      {readingMinutes(p.body)} min read
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter note="Vegan Cook — journal" />
    </div>
  );
}
