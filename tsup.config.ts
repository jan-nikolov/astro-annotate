import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client/index.ts',
  },
  format: ['esm'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  sourcemap: true,
  target: 'es2022',
  external: ['astro', 'vite', 'node:fs', 'node:path', 'node:crypto'],
  minify: false,
});
