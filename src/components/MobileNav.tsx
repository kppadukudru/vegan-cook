import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Recipes", to: "/", hash: "archive" },
  { label: "Journal", to: "/journal" },
  { label: "About", to: "/about" },
  { label: "Submit a recipe", to: "/submit" },
  { label: "Weekly newsletter", to: "/", hash: "weekly" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-ink hover:text-leaf transition-colors p-1 -m-1"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-paper text-ink flex flex-col">
          <div className="border-b border-steel px-6 py-5 flex items-center justify-between">
            <span className="font-serif text-xl tracking-tight">Vegan Cook</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-ink hover:text-leaf transition-colors p-1 -m-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 flex flex-col gap-6 text-[11px] uppercase tracking-[0.18em]">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                onClick={() => setOpen(false)}
                className="border-b border-steel pb-4 hover:text-leaf transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
