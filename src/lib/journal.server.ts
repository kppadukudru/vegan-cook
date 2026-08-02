import type { Database } from "@/integrations/supabase/types";
import type { JournalPost, JournalTag } from "@/lib/journal";

type PostRow = Database["public"]["Tables"]["journal_posts"]["Row"];

export const JOURNAL_COLUMNS =
  "id, title, tag, excerpt, body, cover_url, cover_alt, author, published_at, status";

export function rowToPost(row: Partial<PostRow>): JournalPost {
  return {
    id: row.id!,
    title: row.title!,
    tag: (row.tag ?? "Essay") as JournalTag,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    ...(row.cover_url ? { coverUrl: row.cover_url } : {}),
    ...(row.cover_alt ? { coverAlt: row.cover_alt } : {}),
    author: row.author ?? "Vegan Cook",
    publishedAt: (row.published_at ?? "").slice(0, 10),
    status: (row.status as "published" | "draft") ?? "draft",
  };
}
