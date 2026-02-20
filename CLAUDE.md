# astro-annotate

## Project

Astro integration: visual annotation overlay for staging websites. Clients/stakeholders annotate HTML elements directly in the browser. Annotations stored as structured JSON, readable by developers and LLMs (Claude Code, Cursor).

**Owner:** CRO freelancer building client websites with Astro + Tailwind.

## Research (Feb 2026)

See `docs/research-feb-2026.md` for details on market, competition, Astro+Cloudflare, Integration API.

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Name | `astro-annotate` | "review" too generic (sounds like code review), "feedback" too generic (NPS surveys), "annotate" describes the exact action |
| Packaging | Single npm package | No monorepo overhead, CF adapter via dynamic import, tree-shaking |
| Client UI | Vanilla TypeScript | 0 dependencies, ~25KB bundle, full control |
| CSS Isolation | Shadow DOM | Bidirectional isolation (host ↔ overlay), Tailwind on host unaffected |
| Local Storage | JSON file (annotations.json) | Directly readable by dev + LLM, no export step needed |
| LLM Integration | Read JSON directly | No markdown export, no MCP server. JSON is machine-readable enough. CLI export as future option. |
| Annotation Mode MVP | Developer mode only | Element-based (hover highlights, click annotates). Client mode (free coordinates) possibly later. |
| Auth (Phase 2) | Simple password + session cookie | HMAC-signed, 24h TTL. No OAuth, no user management. Password via env variable. |
| Extensibility | Astro-first, core framework-agnostic | Overlay in vanilla JS, theoretically WP-compatible. But only Astro integration built. |
| Dev Toolbar | Native Astro Dev Toolbar API | First-class icon, consistent UX, no custom toolbar UI. Two runtimes (toolbar app + overlay) communicate via CustomEvents. |

## Commands

- `npx tsup` — Build (project root)
- `npx tsc --noEmit` — Typecheck (project root)
- `cd playground && npx astro dev` — Start playground for testing

## Conventions

- Use "annotations" everywhere (not "feedback", "comments", "review")
- API paths: `/api/astro-annotate/...`
- Shadow DOM root: `#astro-annotate-root`
- CSS class prefix: `aa-` (for astro-annotate)
- Config prefix for env vars: `ASTRO_ANNOTATE_`
- Annotation status: only `'open' | 'resolved'` (no `'wontfix'` — MVP only needs done/reopen)

## Phases

1. **Phase 1 (MVP):** Done. Local dev mode. Overlay + JSON storage + Astro Dev Toolbar integration. Keyboard shortcuts (Alt+C, Escape). Works in `astro dev`.
2. **Phase 2:** Deployed mode on Cloudflare Pages + password auth.
3. **Phase 3:** Polish (screenshots, CLI export, mobile UX, docs, launch).

## GitHub & npm

- GitHub: `jan-nikolov/astro-annotate` (public)
- npm: `astro-annotate` (published, public)
- npm publishing: GitHub Actions Trusted Publishing (OIDC, no token). Node 24+ required (npm >= 11.5.1). Environment: `release`.
- Workflow: `.github/workflows/publish.yml` — triggers on GitHub Release

## Release Workflow

1. Bump version in `package.json`
2. Commit + push
3. `gh release create v<version>` — automatically triggers npm publish via GitHub Actions

## Backlog

- GitHub Issues with labels: `enhancement`, `ux`, `dx`, `phase-2`, `phase-3`, `testing`
- All repo content (issues, code, commits) in English

## Key Files

- `src/integration/index.ts` — Astro integration hooks (config:setup, server:setup)
- `src/client/overlay.ts` — Main orchestrator (Shadow DOM, keyboard, components)
- `src/client/toolbar-app.ts` — Astro Dev Toolbar App (icon toggle, notification dot)
- `src/client/highlighter.ts` — Element hover highlight during annotation mode
- `src/client/pin.ts` — Pin markers + detail popup for existing annotations
- `src/client/form.ts` — Annotation form (devMode-aware)
- `src/client/selector.ts` — CSS selector generation
- `src/integration/vite-plugin.ts` — Virtual module (`virtual:astro-annotate/config`)
- `src/server/dev-middleware.ts` — Vite middleware (REST API)
- `src/storage/local.ts` — JSON file storage
- `playground/` — Test Astro site with 2 pages

## Technical Details

- Build: tsup (ESM only). Entry points: `index` (integration), `client` (overlay), `toolbar-app` (Dev Toolbar)
- Tests: planned — Vitest (unit + integration), Playwright (E2E). Not yet implemented (see Issue #5).
- Astro peer dependency: ^4.0.0 || ^5.0.0 || ^6.0.0
- Script injection stage: `page` (not `page-ssr`)
- Virtual module: `virtual:astro-annotate/config`
- CSS selector priority: #id → [data-testid] → tag+class → nth-child
- Filter Astro-generated classes (astro-*) from selectors
- Dev mode detection: `window.__ASTRO_ANNOTATE_DEV__` global (set via `injectScript`, read in client)
- Dev Toolbar: `addDevToolbarApp()` in integration, `toolbar-app.ts` as separate tsup entry point
- Toolbar ↔ Overlay communication: CustomEvents (`aa:toggle`, `aa:state-changed`, `aa:count`). Loop prevention via `syncing` flag in toolbar-app.
- Keyboard shortcuts: Alt+C (toggle mode), Escape (close form / exit mode), Ctrl+Enter (submit)

## Gotchas

- `injectScript('page', ...)`: Static `import` gets hoisted — code before it (e.g. setting globals) runs AFTER the import. Use dynamic `import()`.
- Keyboard shortcuts with Alt/Option: `e.key` returns special characters on macOS (e.g. Option+C = ç). Always use `e.code` (e.g. `KeyC`).
- Shadow DOM event retargeting: Keyboard events bubble to document, but `event.target` gets retargeted to host element. Register listeners on `document`, not on shadow root.
- View Transitions: On `astro:page-load`, must call `overlay.destroy()` (not just remove DOM), otherwise document-level listeners leak.
