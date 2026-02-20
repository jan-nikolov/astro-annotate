import type { Plugin } from 'vite';
import type { ResolvedConfig } from '../types.js';
import { VIRTUAL_MODULE_ID, RESOLVED_VIRTUAL_MODULE_ID } from '../constants.js';

export function astroAnnotateVitePlugin(config: ResolvedConfig): Plugin {
  return {
    name: 'astro-annotate-config',
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return `export default ${JSON.stringify(config)};`;
      }
    },
  };
}
