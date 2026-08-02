import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { slugify } from "@/lib/recipe-format";
import { rowToPost, JOURNAL_COLUMNS } from "@/lib/journal.server";
import type { JournalPostInput } from "@/lib/journal-schemas";
import type { JournalPost } from "@/lib/journal";

type Result = { ok: boolean; message: string; id?: string };

export async function listAllPosts(): Promise<JournalPost[]> {
  const { data, error } = await supabaseAdmin
    .from("journal_posts")
    .select(JOURNAL_COLUMNS)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPost);
}

export async function savePost(data: JournalPostInput): Promise<Result> {
  const id = data.id?.trim() || slugify(data.title);
  if (!id) return { ok: false, message: "Could not derive an address from that title." };

  const { error } = await supabaseAdmin.from("journal_posts").upsert(
    {
      id,
      title: data.title,
      tag: data.tag,
      excerpt: data.excerpt,
      body: data.body,
      cover_url: data.coverUrl || null,
      cover_alt: data.coverAlt || null,
      author: data.author,
      published_at: data.publishedAt,
      status: data.status,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("savePost failed:", error.message);
    return { ok: false, message: "Could not save the post." };
  }
  return { ok: true, id, message: `Saved "${data.title}".` };
}

export async function deletePost(id: string): Promise<Result> {
  const { error } = await supabaseAdmin.from("journal_posts").delete().eq("id", id);
  if (error) {
    console.error("deletePost failed:", error.message);
    return { ok: false, message: "Could not delete the post." };
  }
  return { ok: true, message: "Post deleted." };
}
