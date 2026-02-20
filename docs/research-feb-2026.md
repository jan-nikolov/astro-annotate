# Research Notes (Feb 2026)

## Market & Competition
- No Astro-specific feedback/annotation tool exists
- Commercial alternatives: Pastel ($35/mo), Marker.io ($39/mo), BugHerd ($50/mo), Usersnap ($49/mo), Ruttl, MarkUp.io ($79/mo)
- None offer LLM-optimized export or element-based annotations with CSS selectors
- Open-source website feedback tools: none. Only academic annotation tools (Hypothesis, Annotator.js)
- Existing Astro integrations (Feelback, Sentry Feedback, Giscus) serve different use cases (user feedback, bug reporting, blog comments)

## Name Availability (checked Feb 2026)
- npm: `astro-annotate` available (also astro-review, astro-feedback, astro-comments)
- GitHub: `astro-annotate` available

## Astro + Cloudflare
- Astro was acquired by Cloudflare in January 2026
- Astro 6 Beta (Feb 2026) has native CF Workers/KV/D1/R2 integration
- `@astrojs/cloudflare` adapter exists (official)
- Cloudflare Pages: free tier with custom domains, auto-deploy, 20k files
- D1 (SQLite), KV (Key-Value), R2 (Object Storage) all available in free tier

## Astro Integration API
- `astro:config:setup`: injectScript (stages: before-hydration, page), injectRoute, addMiddleware, updateConfig (Vite plugins)
- `astro:server:setup`: Vite Dev Server Middleware (dev mode only, not preview/deployed)
- `astro:config:done`: injectTypes for Virtual Module Type Declarations
- `injectScript('page-ssr', ...)` is problematic — Astro global not available, only runs once. Avoid.
- View Transitions: `astro:page-load` event for re-initialization after SPA navigation
- `npx astro add` works automatically when `astro-integration` is in package.json keywords
