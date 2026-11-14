import { Children, isValidElement, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { resolveLink, type SlugIndex } from "~/lib/links";

// Markdown is rendered without raw HTML (none of the stored articles use it), so stored text can never inject markup.

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement<{ children?: ReactNode }>(c) ? textOf(c.props.children) : ""))
    .join("");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[*_`~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

/** Section headings (h2) of an article, for the "On this page" list. */
export const headingsOf = (markdown: string) =>
  [...markdown.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const text = m[1].replace(/[*_`]/g, "").trim();
    return { id: slugify(text), text };
  });

export function Article({ markdown, slugIndex }: { markdown: string; slugIndex: SlugIndex }) {
  const components = useMemo<Components>(
    () => ({
      h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
      h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
      a: ({ href, children }) => {
        const target = resolveLink(href, slugIndex);
        if (target.kind === "internal") return target.to.startsWith("#") ? <a href={target.to}>{children}</a> : <Link to={target.to}>{children}</Link>;
        if (target.kind === "external")
          return (
            <a href={target.href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
              <ExternalLink size={12} className="ml-0.5 inline-block align-baseline opacity-70" />
            </a>
          );
        return <span className="font-semibold text-star">{children}</span>;
      },
      img: ({ src, alt }) => (typeof src === "string" && /^https:\/\//.test(src) ? <img src={src} alt={alt || ""} loading="lazy" decoding="async" className="rounded-2xl" /> : null),
      table: ({ children }) => (
        <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-fg/10">
          <table className="w-full min-w-[520px] text-left text-sm [&_td]:border-t [&_td]:border-fg/[0.06] [&_td]:px-4 [&_td]:py-3 [&_td]:text-mist [&_th]:bg-fg/[0.04] [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-star">
            {children}
          </table>
        </div>
      ),
    }),
    [slugIndex],
  );

  return (
    <div className="article prose prose-invert max-w-none prose-headings:text-star prose-h2:mt-12 prose-h2:text-[1.75rem] prose-h3:text-xl prose-p:leading-[1.8] prose-li:my-1.5 prose-strong:text-star sm:prose-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
