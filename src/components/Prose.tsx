import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Long-form body copy styled with the site's editorial type scale. */
export function Prose({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-6 text-base leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-serif text-3xl leading-tight tracking-tight pt-4">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-2xl leading-tight tracking-tight pt-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute pt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-mute leading-relaxed max-w-[68ch] text-pretty">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-2 text-mute max-w-[68ch]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-2 text-mute max-w-[68ch]">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-leaf pl-5 text-ink font-serif text-xl leading-snug max-w-[52ch]">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline decoration-steel underline-offset-4 hover:text-leaf transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-steel" />,
          code: ({ children }) => (
            <code className="bg-secondary px-1.5 py-0.5 text-sm">{children}</code>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
