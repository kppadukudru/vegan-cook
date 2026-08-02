import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { JournalPost } from "@/lib/journal";

/** Public: every published post, newest first. */
export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<JournalPost[]> => {
    const { createPublicClient } = await import("@/lib/recipes.server");
    const { rowToPost, JOURNAL_COLUMNS } = await import("@/lib/journal.server");
    const { data, error } = await createPublicClient()
      .from("journal_posts")
      .select(JOURNAL_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      console.error("listPublishedPosts failed:", error.message);
      return [];
    }
    return (data ?? []).map(rowToPost);
  },
);

/** Public: one published post, or null when missing or still a draft. */
export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().max(120) }).parse(data))
  .handler(async ({ data }): Promise<JournalPost | null> => {
    const { createPublicClient } = await import("@/lib/recipes.server");
    const { rowToPost, JOURNAL_COLUMNS } = await import("@/lib/journal.server");
    const { data: row, error } = await createPublicClient()
      .from("journal_posts")
      .select(JOURNAL_COLUMNS)
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("getPublishedPost failed:", error.message);
      return null;
    }
    return row ? rowToPost(row) : null;
  });
