export const ALL_JOURNAL_TAGS = ["Travel", "Allergies", "Alternatives", "Essay"] as const;
export type JournalTag = (typeof ALL_JOURNAL_TAGS)[number];

export interface JournalPost {
  id: string;
  title: string;
  tag: JournalTag;
  excerpt: string;
  body: string;
  coverUrl?: string;
  coverAlt?: string;
  author: string;
  publishedAt: string;
  status: "published" | "draft";
}

/** Rough reading time, rounded up to whole minutes. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export function formatPostDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
