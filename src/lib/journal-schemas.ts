import { z } from "zod";
import { ALL_JOURNAL_TAGS } from "@/lib/journal";

export const journalPostInput = z.object({
  id: z.string().trim().max(120).optional(),
  title: z.string().trim().min(4).max(200),
  tag: z.enum(ALL_JOURNAL_TAGS),
  excerpt: z.string().trim().max(600).default(""),
  body: z.string().trim().min(20).max(80000),
  coverUrl: z
    .string()
    .trim()
    .max(600)
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "Image link must start with http:// or https://",
    )
    .default(""),
  coverAlt: z.string().trim().max(200).default(""),
  author: z.string().trim().min(2).max(120).default("Vegan Cook"),
  publishedAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["published", "draft"]),
});

export type JournalPostInput = z.infer<typeof journalPostInput>;

export const journalIdInput = z.object({ id: z.string().max(120) });
