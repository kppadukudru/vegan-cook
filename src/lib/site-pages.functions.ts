import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SitePage } from "@/lib/site-pages";

/** Public: one published page's copy, or null when missing. */
export const getSitePage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().max(60) }).parse(data))
  .handler(async ({ data }): Promise<SitePage | null> => {
    const { createPublicClient } = await import("@/lib/recipes.server");
    const { rowToPage, SITE_PAGE_COLUMNS } = await import("@/lib/site-pages.server");
    const { data: row, error } = await createPublicClient()
      .from("site_pages")
      .select(SITE_PAGE_COLUMNS)
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("getSitePage failed:", error.message);
      return null;
    }
    return row ? rowToPage(row) : null;
  });
