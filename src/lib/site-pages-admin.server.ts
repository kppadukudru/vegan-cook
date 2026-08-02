import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rowToPage, SITE_PAGE_COLUMNS } from "@/lib/site-pages.server";
import type { SitePageInput } from "@/lib/site-pages-schemas";
import type { SitePage } from "@/lib/site-pages";

type Result = { ok: boolean; message: string };

export async function listSitePages(): Promise<SitePage[]> {
  const { data, error } = await supabaseAdmin
    .from("site_pages")
    .select(SITE_PAGE_COLUMNS)
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPage);
}

export async function saveSitePage(data: SitePageInput): Promise<Result> {
  const { error } = await supabaseAdmin.from("site_pages").upsert(
    {
      id: data.id,
      heading: data.heading,
      body: data.body,
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
      status: data.status,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("saveSitePage failed:", error.message);
    return { ok: false, message: "Could not save that page." };
  }
  return { ok: true, message: "Page saved." };
}
