# astro-annotate

Visual annotation overlay for Astro staging sites. Clients and stakeholders annotate HTML elements directly in the browser. Annotations are stored as structured JSON, readable by developers and LLMs.

> **Status:** Phase 1 (MVP) &mdash; local dev mode. Works with `astro dev`.

## Features

- **Element-based annotations** &mdash; hover to highlight, click to annotate any HTML element
- **CSS selector tracking** &mdash; annotations reference elements by robust CSS selectors (IDs, data-testid, tag+class)
- **JSON storage** &mdash; annotations saved as `annotations.json`, directly readable by developers and LLMs (Claude Code, Cursor, etc.)
- **Shadow DOM isolation** &mdash; overlay UI is fully isolated from your site's styles
- **Zero dependencies** &mdash; vanilla TypeScript client, ~24KB bundle
- **Device detection** &mdash; automatically tags annotations as mobile/tablet/desktop

## Installation

```bash
npx astro add astro-annotate
```

Or manually:

```bash
npm install astro-annotate
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import annotate from 'astro-annotate';

export default defineConfig({
  integrations: [annotate()],
});
```

## Usage

1. Start `astro dev`
2. Click the annotation button (bottom-right corner)
3. Hover over elements to highlight them, click to annotate
4. Annotations are saved to `annotations.json` in your project root

### Reading annotations

The `annotations.json` file is structured for both humans and machines:

```json
{
  "version": "1.0",
  "annotations": [
    {
      "id": "abc123",
      "page": "/",
      "selector": "h1.hero-title",
      "text": "Make this headline shorter",
      "author": "Client Name",
      "status": "open",
      "device": "desktop",
      "viewport": { "width": 1440, "height": 900 }
    }
  ]
}
```

## Configuration

```js
annotate({
  enabled: true,              // default: true in dev
  storage: 'local',           // default: 'local' (JSON file)
  annotationsPath: './annotations.json',  // default
})
```

## Roadmap

- **Phase 2:** Deployed mode on Cloudflare Pages with password auth
- **Phase 3:** Screenshots, CLI export, mobile UX, docs

## License

MIT
