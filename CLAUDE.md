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
| Client UI | Vanilla TypeScript | 0 dependencies, ~44KB bundle, full control |
| CSS Isolation | Shadow DOM | Bidirectional isolation (host ↔ overlay), Tailwind on host unaffected |
| Local Storage | JSON file (annotations.json) | Directly readable by dev + LLM, no export step needed |
| LLM Integration | Read JSON directly | No markdown export, no MCP server. JSON is machine-readable enough. CLI export as future option. |
| Annotation Mode MVP | Developer mode only | Element-based (hover highlights, click annotates). Client mode (free coordinates) possibly later. |
| Auth (Phase 2) | Simple password + session cookie | HMAC-signed, 24h TTL. No OAuth, no user management. Password via env variable. |
| Extensibility | Astro-first, core framework-agnostic | Overlay in vanilla JS, theoretically WP-compatible. But only Astro integration built. |
| Dev Toolbar | Native Astro Dev Toolbar API | First-class icon, consistent UX, no custom toolbar UI. Two runtimes (toolbar app + overlay) communicate via CustomEvents. |
| FAB Roles | Fixed per button | Upper = annotation mode toggle (crosshair/X), lower = panel toggle (speech bubble). Prevents role confusion. |
| Pin Style | Figma-style teardrops | No numbers, 20×20px, atan2-based tilt pointing toward annotated element. Clean, minimal. |
| Panel Drag | DragResize + snap-to-side | Free drag via header, resize via corner handle. Snap zones at viewport edges dock panel. Replaces hover-evade. |

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

1. **Phase 1 (MVP):** Done. Local dev mode. Overlay + JSON storage + Astro Dev Toolbar integration + Annotations Panel + Inline Comment Input. Keyboard shortcuts (Alt+C, Alt+L, Escape). Draggable panel with snap-to-side docking and resize. Fixed FAB roles (upper=annotate, lower=panel). Figma-style pins with atan2 directional tilt. Smooth pin scrolling with rAF + alternate placement. Mobile responsive. Works in `astro dev`.
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
- `src/client/panel.ts` — Annotations panel (filter, inline edit, bulk resolve, draggable, snap-to-side docking, resize)
- `src/client/drag.ts` — DragResize helper (drag handle + resize handle, bounds clamping, click suppression)
- `src/client/pin.ts` — Pin markers + detail popup for existing annotations
- `src/client/form.ts` — Inline comment input (floating card with arrow, auto-resize textarea, devMode-aware)
- `src/client/utils.ts` — Shared utilities (escapeHtml)
- `src/client/index.ts` — Client entry point (init, sessionStorage persistence, View Transition support)
- `src/client/selector.ts` — CSS selector generation
- `src/integration/vite-plugin.ts` — Virtual module (`virtual:astro-annotate/config`) + Vite watcher exclusion for annotations.json
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
- Keyboard shortcuts: Alt+C (toggle mode), Alt+L (toggle panel), Escape (close form / panel / exit mode), Ctrl+Enter (submit)
- Panel modes: `'docked' | 'floating'`. Docked = CSS-positioned sidebar. Floating = inline-styled, free position. Snap-to-side at <60px from viewport edge.
- DragResize: Generic helper class. Drag via header mousedown, resize via corner handle. hasMoved threshold (3px) prevents accidental drags from suppressing clicks.
- Pin tilt: `Math.atan2(elCenter - pinCenter)` computes angle from pin to element in screen coords (y-down). Teardrop sharp corner (border-radius 0 = bottom-left) at 135° in screen coords → `rotation = angle - 135`. Inline `transform: rotate()`. CSS `scale` property for hover (doesn't conflict with inline transform).

## Gotchas

- `injectScript('page', ...)`: Static `import` gets hoisted — code before it (e.g. setting globals) runs AFTER the import. Use dynamic `import()`.
- Keyboard shortcuts with Alt/Option: `e.key` returns special characters on macOS (e.g. Option+C = ç). Always use `e.code` (e.g. `KeyC`).
- Shadow DOM event retargeting: Keyboard events bubble to document, but `event.target` gets retargeted to host element. Register listeners on `document`, not on shadow root.
- View Transitions: On `astro:page-load`, must call `overlay.destroy()` (not just remove DOM), otherwise document-level listeners leak.
- Module-level variables: Do NOT survive full page reloads (only View Transitions). Use `sessionStorage` for state that must persist across navigations.
- Playground View Transitions: Both playground pages need `<ClientRouter />` (Astro 5+) for SPA navigation, otherwise every link is a full reload.
- Vite HMR + annotations.json: Writing annotations.json triggers Vite's file watcher → full page reload. Fixed by unwatching the file in `configureServer()` hook.
- Pin rendering on scroll: Never destroy/recreate Pin DOM elements on scroll. Use `updatePositions()` to update only `top`/`left` styles. Use rAF-throttled scroll handler for smooth performance.
- Panel innerHTML: Uses `contentWrapper` (child of container) for innerHTML, so `resizeHandle` (sibling) survives re-renders. DragResize is destroyed/recreated after each render because header DOM is replaced.
- CSS `scale` vs `transform`: Pin hover uses `scale: 1.15` (separate CSS property) to avoid conflicting with inline `transform: rotate()` set by atan2 tilt calculation.
