import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Recipe } from "@/data/recipes";

const BASE_URL = "https://www.vegancook.live";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { createPublicClient } = await import("@/lib/recipes.server");
        const { data } = await createPublicClient()
          .from("recipes")
          .select("id")
          .eq("status", "published");
        const recipeIds = (data ?? []).map((row: Pick<Recipe, "id">) => row.id);

        const { data: postRows } = await createPublicClient()
          .from("journal_posts")
          .select("id")
          .eq("status", "published");
        const postIds = (postRows ?? []).map((row: { id: string }) => row.id);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/vegan-breakfast-ideas", changefreq: "weekly", priority: "0.9" },
          { path: "/submit", changefreq: "monthly", priority: "0.6" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/journal", changefreq: "weekly", priority: "0.8" },
          ...postIds.map((id) => ({
            path: `/journal/${id}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...recipeIds.map((id) => ({
            path: `/recipes/${id}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];


        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
