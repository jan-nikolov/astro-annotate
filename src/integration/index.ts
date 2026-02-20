import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import type { AstroAnnotateConfig, ResolvedConfig } from '../types.js';
import { DEFAULT_ANNOTATIONS_PATH } from '../constants.js';
import { astroAnnotateVitePlugin } from './vite-plugin.js';
import { LocalStorage } from '../storage/local.js';
import { registerDevMiddleware } from '../server/dev-middleware.js';

const ANNOTATE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="12" y1="6" x2="12" y2="12"/></svg>`;

export function createIntegration(userConfig: AstroAnnotateConfig = {}): AstroIntegration {
  let resolvedConfig: ResolvedConfig;
  let projectRoot: string;

  return {
    name: 'astro-annotate',
    hooks: {
      'astro:config:setup'({ config, command, updateConfig, injectScript, addDevToolbarApp, logger }) {
        projectRoot = fileURLToPath(config.root);

        const isDev = command === 'dev' || command === 'preview';
        const enabled = userConfig.enabled ?? isDev;

        if (!enabled) {
          logger.info('Disabled (set enabled: true to force)');
          return;
        }

        resolvedConfig = {
          enabled,
          mode: isDev ? 'dev' : 'deployed',
          storage: userConfig.storage ?? 'local',
          annotationsPath: userConfig.annotationsPath ?? DEFAULT_ANNOTATIONS_PATH,
        };

        // Add Vite plugin for virtual module
        updateConfig({
          vite: {
            plugins: [astroAnnotateVitePlugin(resolvedConfig)],
          },
        });

        // Register Dev Toolbar app (icon in Astro toolbar)
        if (isDev) {
          const toolbarAppPath = resolve(dirname(fileURLToPath(import.meta.url)), 'toolbar-app.js');
          addDevToolbarApp({
            id: 'astro-annotate',
            name: 'Annotate',
            icon: ANNOTATE_ICON,
            entrypoint: toolbarAppPath,
          });
        }

        // Inject client overlay script
        // At runtime, import.meta.url points to dist/index.js, client bundle is dist/client.js
        const clientPath = resolve(dirname(fileURLToPath(import.meta.url)), 'client.js');
        injectScript('page', `window.__ASTRO_ANNOTATE_DEV__=${isDev};import("${clientPath}");`);

        logger.info('Overlay enabled');
      },

      'astro:server:setup'({ server, logger }) {
        if (!resolvedConfig) return;

        const storage = new LocalStorage(resolvedConfig.annotationsPath, projectRoot);
        registerDevMiddleware(server, storage);
        logger.info('Dev middleware registered');
      },
    },
  };
}
