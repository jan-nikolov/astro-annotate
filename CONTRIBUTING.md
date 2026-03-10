# Contributing to astro-annotate

Contributions are welcome! Here's how to get started.

## Prerequisites

- Node.js 24+
- npm

## Setup

```bash
git clone https://github.com/jan-nikolov/astro-annotate.git
cd astro-annotate
npm install
npx tsup
```

## Development

```bash
# Watch mode (rebuilds on changes)
npm run dev

# Start the playground for testing
cd playground && npx astro dev

# Typecheck
npm run typecheck
```

The playground uses a `file:..` dependency, so it loads the built files from `dist/` directly. After rebuilding, hard-refresh the browser to see changes.

## Conventions

- See `CLAUDE.md` for architecture decisions, naming conventions, and technical details
- All code, commits, issues, and PRs in English
- CSS class prefix: `aa-`
- Use "annotations" (not "feedback", "comments", "review")

## Submitting Changes

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `npm run typecheck` to verify
4. Open a PR with a clear description of the change
