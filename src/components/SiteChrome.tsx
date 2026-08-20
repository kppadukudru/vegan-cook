import { Link } from "@tanstack/react-router";
import { MobileNav } from "@/components/MobileNav";

export function SiteHeader() {
  return (
    <header className="border-b border-steel px-6 md:px-8 py-5 flex items-center justify-between uppercase text-[10px] tracking-[0.15em] font-medium">
      <div className="flex gap-8 md:gap-12 items-center">
          <MobileNav />
        <Link to="/" className="font-serif text-xl tracking-tight normal-case">
          Vegan Cook
        </Link>
        <nav className="hidden md:flex gap-8 text-mute">
          <Link
            to="/recipes"
            activeProps={{ className: "text-ink" }}
            className="hover:text-ink transition-colors"
          >
            Recipes
          </Link>

          <Link
            to="/vegan-breakfast-ideas"
            activeProps={{ className: "text-ink" }}
            className="hover:text-ink transition-colors"
          >
            Breakfast
          </Link>
          <Link
            to="/gluten-free-vegan-recipes"
            activeProps={{ className: "text-ink" }}
            className="hover:text-ink transition-colors"
          >
            Gluten-free
          </Link>

          <Link
            to="/journal"
            activeProps={{ className: "text-ink" }}
            className="hover:text-ink transition-colors"
          >
            Journal
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-ink" }}
            className="hover:text-ink transition-colors"
          >
            About
          </Link>
          <Link to="/submit" className="hover:text-ink transition-colors">
            Submit a recipe
          </Link>
        </nav>
      </div>
      <Link to="/" hash="weekly" className="bg-ink text-paper px-4 py-2 hover:bg-leaf transition-colors">
        Get the weekly newsletter
      </Link>
    </header>
  );
}

export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="border-t border-steel px-6 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-mute">
      <span>{note ?? "Vegan Cook - Recipes for every day plant based cooking"}</span>
      <div className="flex gap-6">
        <Link to="/recipes" className="hover:text-ink transition-colors">
          Recipes
        </Link>
        <Link to="/journal" className="hover:text-ink transition-colors">
          Journal
        </Link>

        <Link to="/about" className="hover:text-ink transition-colors">
          About
        </Link>
        <Link to="/auth" className="hover:text-ink transition-colors">
          Editor sign-in
        </Link>
      </div>
    </footer>
  );
}
