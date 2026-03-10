# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0] - 2026-03-10

### Added
- Pin clustering: annotations on the same element are grouped into a single pin with a count badge
- Thread popups: clustered pins open a thread view showing all annotations
- Escape stack: last-opened UI element closes first on Escape (form → detail → panel → mode)
- Panel drag & resize: free-drag via header, resize via corner handle, snap-to-side docking with animated transitions
- FAB side-switching: FABs move to opposite side when panel is docked
- Off-viewport indicators: shows annotation count above/below the visible area

### Fixed
- Event listener accumulation in annotation form (prevented duplicate submissions on repeated open/close)
- z-index stacking: clear internal layering instead of all elements at max value
- Thread popup scroll with correct flex layout
- Viewport overflow for thread popups

## [0.4.0] - 2026-02-22

### Added
- Annotations Panel (Alt+L): sidebar with filterable list of all annotations — inline edit, status toggle, bulk resolve, left/right docking
- Panel state persistence: panel visibility, filter, and side survive page navigations (View Transitions) and full reloads (sessionStorage)
- FAB-pin overlap fix: pins that collide with the FAB shift left automatically
- Playground View Transitions: both playground pages now use `<ClientRouter />` for SPA navigation
- Dark mode support for panel styles

## [0.3.0] - 2026-02-20

### Added
- Native Astro Dev Toolbar integration via `addDevToolbarApp()` API
- Notification dot on toolbar icon when open annotations exist
- Keyboard shortcuts (Alt+C, Escape) sync toolbar icon state via CustomEvents

### Removed
- Custom toolbar component and associated CSS (~130 lines removed)

## [0.2.0] - 2026-02-20

### Added
- No author name field in dev mode — author defaults to "Developer"
- Persistent annotation mode — stays active after submit
- Keyboard shortcuts: Alt+C (toggle mode), Escape (close form / exit mode), Ctrl+Enter (submit)

### Fixed
- View Transitions cleanup leak (stale event listeners)
- Pre-existing TypeScript errors
- Guard against clicking new element while form is open

[0.5.0]: https://github.com/jan-nikolov/astro-annotate/releases/tag/v0.5.0
[0.4.0]: https://github.com/jan-nikolov/astro-annotate/releases/tag/v0.4.0
[0.3.0]: https://github.com/jan-nikolov/astro-annotate/releases/tag/v0.3.0
[0.2.0]: https://github.com/jan-nikolov/astro-annotate/releases/tag/v0.2.0
