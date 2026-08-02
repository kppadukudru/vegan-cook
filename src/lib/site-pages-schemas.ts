import { z } from "zod";

export const sitePageInput = z.object({
  id: z.string().trim().min(2).max(60),
  heading: z.string().trim().min(4).max(300),
  body: z.string().trim().min(20).max(80000),
  metaTitle: z.string().trim().min(4).max(120),
  metaDescription: z.string().trim().min(10).max(300),
  status: z.enum(["published", "draft"]),
});

export type SitePageInput = z.infer<typeof sitePageInput>;
