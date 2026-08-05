import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertAdmin,
  isCallerAdmin,
  idInput,
  publishInput,
  recipeInput,
  rejectInput,
} from "@/lib/admin-schemas";
import { importInput } from "@/lib/csv-import";
import { journalIdInput, journalPostInput } from "@/lib/journal-schemas";
import { sitePageInput } from "@/lib/site-pages-schemas";
import type { Recipe } from "@/data/recipes";

/** Who am I, and am I allowed into the editor? */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await isCallerAdmin(context), userId: context.userId };
  });

/** Every recipe, drafts included. */
export const adminListRecipes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Recipe[]> => {
    await assertAdmin(context);
    const { rowToRecipe, RECIPE_COLUMNS } = await import("@/lib/recipes.server");
    const { data, error } = await context.supabase
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToRecipe);
  });

/** Create or update a recipe; free text is parsed into the site's own format. */
export const adminSaveRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recipeInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { saveRecipe } = await import("@/lib/admin.server");
    return saveRecipe(data);
  });

export const adminDeleteRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { deleteRecipe } = await import("@/lib/admin.server");
    return deleteRecipe(data.id);
  });

/** One-click publish / unpublish from the recipe list. */
export const adminSetRecipeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recipeStatusInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { setRecipeStatus } = await import("@/lib/admin.server");
    return setRecipeStatus(data.id, data.status);
  });

/** Publish every recipe currently sitting in draft. */
export const adminPublishAllDrafts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { publishAllDrafts } = await import("@/lib/admin.server");
    return publishAllDrafts();
  });


/** The review queue. */
export const adminListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listSubmissions } = await import("@/lib/admin.server");
    return listSubmissions();
  });

/** Turn a submission into a live recipe in the site's standard format. */
export const adminPublishSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => publishInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { publishSubmission } = await import("@/lib/admin.server");
    return publishSubmission(data.id, data.asDraft);
  });

export const adminRejectSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rejectInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { rejectSubmission } = await import("@/lib/admin.server");
    return rejectSubmission(data.id, data.notes);
  });

/** Bulk CSV import; rows land as drafts unless the editor asks to publish. */
export const adminImportRecipes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => importInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { importRecipes } = await import("@/lib/admin.server");
    return importRecipes(data.rows, data.publish);
  });

/** Journal: every post, drafts included. */
export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listAllPosts } = await import("@/lib/journal-admin.server");
    return listAllPosts();
  });

/** Journal: create or update a post. */
export const adminSavePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => journalPostInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { savePost } = await import("@/lib/journal-admin.server");
    return savePost(data);
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => journalIdInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { deletePost } = await import("@/lib/journal-admin.server");
    return deletePost(data.id);
  });

/** Page copy: every editable page, drafts included. */
export const adminListSitePages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listSitePages } = await import("@/lib/site-pages-admin.server");
    return listSitePages();
  });

/** Page copy: save one page. */
export const adminSaveSitePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sitePageInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { saveSitePage } = await import("@/lib/site-pages-admin.server");
    return saveSitePage(data);
  });
