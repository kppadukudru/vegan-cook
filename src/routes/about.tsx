import { createFileRoute, Link } from "@tanstack/react-router";
import { getSitePage } from "@/lib/site-pages.functions";
import { ABOUT_FALLBACK } from "@/lib/site-pages";
import { Prose } from "@/components/Prose";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";



export const Route = createFileRoute("/about")({
  loader: async () => (await getSitePage({ data: { id: "about" } })) ?? ABOUT_FALLBACK,
  head: ({ loaderData }) => {
    const page = loaderData ?? ABOUT_FALLBACK;
    return {
      meta: [
        { title: page.metaTitle },
        { name: "description", content: page.metaDescription },
        { property: "og:title", content: page.metaTitle },
        { property: "og:description", content: page.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://www.vegancook.live/about" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: "https://www.vegancook.live/about" }],
    };
  },
  errorComponent: () => (
    <div className="p-10 text-sm text-mute">Could not load this page. Please refresh.</div>
  ),
  notFoundComponent: () => <div className="p-10 text-sm text-mute">Page not found.</div>,
  component: AboutPage,
});

function AboutPage() {
  const page = Route.useLoaderData();

  return (
    <div className="bg-paper text-ink min-h-dvh antialiased">
      <SiteHeader />

      <main className="max-w-[1440px] mx-auto">
        <section className="border-b border-steel px-6 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <p className="lg:col-span-3 text-[10px] uppercase tracking-[0.15em] text-mute">About</p>
          <div className="lg:col-span-9">
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance max-w-[38ch]">
              {page.heading}
            </h1>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-4">
            <Link
              to="/journal"
              className="block text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              Read the journal →
            </Link>
            <Link
              to="/submit"
              className="block text-[10px] uppercase tracking-[0.15em] text-mute hover:text-ink transition-colors"
            >
              Submit a recipe →
            </Link>
          </div>
          <div className="lg:col-span-9">
            <Prose markdown={page.body} />
          </div>
        </section>
      </main>

      <SiteFooter note="Vegan Cook, about" />
    </div>
  );
}
