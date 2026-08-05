import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Recipe } from "@/data/recipes";

const BASE_URL = "https://www.vegancook.live";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const day = (value: string | null | undefined) =>
          value ? value.slice(0, 10) : undefined;

        const { createPublicClient } = await import("@/lib/recipes.server");
        const { data } = await createPublicClient()
          .from("recipes")
          .select("id, published_at")
          .eq("status", "published");
        const recipes = (data ?? []) as { id: string; published_at: string | null }[];

        const { data: postRows } = await createPublicClient()
          .from("journal_posts")
          .select("id, published_at")
          .eq("status", "published");
        const posts = (postRows ?? []) as { id: string; published_at: string | null }[];

        const { data: pageRows } = await createPublicClient()
          .from("site_pages")
          .select("id, updated_at")
          .eq("status", "published");
        const pages = (pageRows ?? []) as { id: string; updated_at: string | null }[];

        /** Latest published date across a set — the collection's own last change. */
        const latest = (values: (string | null | undefined)[]) => {
          const days = values.map(day).filter(Boolean).sort() as string[];
          return days.length > 0 ? days[days.length - 1] : undefined;
        };

        const latestRecipe = latest(recipes.map((r) => r.published_at));
        const latestPost = latest(posts.map((p) => p.published_at));
        const aboutUpdated = day(pages.find((p) => p.id === "about")?.updated_at);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0", ...(latestRecipe ? { lastmod: latestRecipe } : {}) },
          {
            path: "/recipes",
            changefreq: "weekly",
            priority: "0.9",
            ...(latestRecipe ? { lastmod: latestRecipe } : {}),
          },

          {
            path: "/vegan-breakfast-ideas",
            changefreq: "weekly",
            priority: "0.9",
            ...(latestRecipe ? { lastmod: latestRecipe } : {}),
          },
          { path: "/submit", changefreq: "monthly", priority: "0.6" },
          { path: "/about", changefreq: "monthly", priority: "0.6", ...(aboutUpdated ? { lastmod: aboutUpdated } : {}) },
          { path: "/journal", changefreq: "weekly", priority: "0.8", ...(latestPost ? { lastmod: latestPost } : {}) },
          ...posts.map((p) => ({
            path: `/journal/${p.id}`,
            changefreq: "monthly" as const,
            priority: "0.7",
            ...(day(p.published_at) ? { lastmod: day(p.published_at)! } : {}),
          })),
          ...recipes.map((r) => ({
            path: `/recipes/${r.id}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            ...(day(r.published_at) ? { lastmod: day(r.published_at)! } : {}),
          })),
        ];


        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
