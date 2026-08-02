import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Prose } from "@/components/Prose";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getPublishedPost } from "@/lib/journal.functions";
import { formatPostDate, readingMinutes } from "@/lib/journal";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { id: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Post unavailable — Vegan Cook" }, { name: "robots", content: "noindex" }],
      };
    }
    const url = `https://www.vegancook.live/journal/${loaderData.id}`;
    const title = `${loaderData.title} — Vegan Cook Journal`;
    const description = loaderData.excerpt || `${loaderData.tag} notes from the Vegan Cook journal.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: loaderData.coverUrl ? "summary_large_image" : "summary" },
        ...(loaderData.coverUrl
          ? [
              { property: "og:image", content: loaderData.coverUrl },
              { name: "twitter:image", content: loaderData.coverUrl },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: loaderData.title,
            description,
            datePublished: loaderData.publishedAt,
            author: { "@type": "Person", name: loaderData.author },
            publisher: { "@type": "Organization", name: "Vegan Cook" },
            mainEntityOfPage: url,
            ...(loaderData.coverUrl ? { image: loaderData.coverUrl } : {}),
            keywords: loaderData.tag,
          }),
        },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  errorComponent: () => (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="font-serif text-3xl tracking-tight">This post won't load</h1>
        <Link to="/journal" className="text-sm underline">
          Back to the journal
        </Link>
      </div>
    </div>
  ),
  component: PostPage,
});

function PostNotFound() {
  return (
    <div className="bg-paper text-ink min-h-dvh grid place-items-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-serif text-3xl tracking-tight">No such post</h1>
        <p className="text-sm text-mute">
          It may have been unpublished while it's being rewritten.
        </p>
        <Link
          to="/journal"
          className="inline-block bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors"
        >
          Back to the journal
        </Link>
      </div>
    </div>
  );
}

function PostPage() {
  const post = Route.useLoaderData();

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <article className="max-w-[1440px] mx-auto">
        <header className="border-b border-steel px-6 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-2 text-[10px] uppercase tracking-[0.15em] text-mute">
            <p>{post.tag}</p>
            <p className="tabular-nums">{formatPostDate(post.publishedAt)}</p>
            <p>{readingMinutes(post.body)} min read</p>
            <p>{post.author}</p>
          </div>
          <div className="lg:col-span-9 space-y-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[40ch]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-mute text-base leading-relaxed max-w-[62ch] text-pretty">
                {post.excerpt}
              </p>
            )}
            {post.coverUrl && (
              <img
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                className="w-full aspect-[3/2] object-cover border border-steel"
              />
            )}
          </div>
        </header>

        <div className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <Link
              to="/journal"
              className="text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              ← All posts
            </Link>
          </div>
          <div className="lg:col-span-9">
            <Prose markdown={post.body} />
          </div>
        </div>
      </article>

      <SiteFooter note="Vegan Cook — journal" />
    </div>
  );
}
