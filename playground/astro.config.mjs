import { defineConfig } from 'astro/config';
import astroAnnotate from 'astro-annotate';

export default defineConfig({
  integrations: [astroAnnotate()],
});
