import type { Database } from "@/integrations/supabase/types";
import type { SitePage } from "@/lib/site-pages";

type PageRow = Database["public"]["Tables"]["site_pages"]["Row"];

export const SITE_PAGE_COLUMNS = "id, heading, body, meta_title, meta_description, status";

export function rowToPage(row: Partial<PageRow>): SitePage {
  return {
    id: row.id!,
    heading: row.heading ?? "",
    body: row.body ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    status: (row.status as "published" | "draft") ?? "draft",
  };
}
