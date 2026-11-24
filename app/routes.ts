import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

// Every public page exists in English (/...) and Hindi (/hi/...). Same file, separate route ids.
const localized = (path: string, file: string, id: string) => [
  route(path, file, { id: `en-${id}` }),
  route(path ? `hi/${path}` : "hi", file, { id: `hi-${id}` }),
];

export default [
  layout("routes/site-layout.tsx", [
    index("routes/home.tsx", { id: "en-home" }),
    route("hi", "routes/home.tsx", { id: "hi-home" }),
    ...localized("calculators", "routes/calculators.tsx", "calculators"),
    ...localized("calculators/love-calculator", "routes/love-calculator.tsx", "love-calculator"),
    ...localized("calculators/:slug", "routes/calculator.tsx", "calculator"),
    ...localized("calculators/:slug/result", "routes/result.tsx", "result"),
    ...localized("tools/:tool", "routes/tool.tsx", "tool"),
    ...localized("blogs", "routes/blog.tsx", "blog"),
    ...localized("blogs/:slug", "routes/blog-post.tsx", "blog-post"),
    // Lumi chat (English only for now)
    route("lumi", "routes/lumi.tsx", { id: "en-lumi" }),
  ]),

  route("admin/login", "routes/admin/login.tsx"),
  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/calculators.tsx"),
    route("admin/calculators/new", "routes/admin/edit.tsx", { id: "admin-new" }),
    route("admin/calculators/:calculatorId", "routes/admin/edit.tsx", { id: "admin-edit" }),
  ]),

  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
