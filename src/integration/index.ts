import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import type { AstroAnnotateConfig, ResolvedConfig } from '../types.js';
import { DEFAULT_ANNOTATIONS_PATH } from '../constants.js';
import { astroAnnotateVitePlugin } from './vite-plugin.js';
import { LocalStorage } from '../storage/local.js';
import { registerDevMiddleware } from '../server/dev-middleware.js';

export function createIntegration(userConfig: AstroAnnotateConfig = {}): AstroIntegration {
  let resolvedConfig: ResolvedConfig;
  let projectRoot: string;

  return {
    name: 'astro-annotate',
    hooks: {
      'astro:config:setup'({ config, command, updateConfig, injectScript, logger }) {
        projectRoot = fileURLToPath(config.root);

        const isDev = command === 'dev' || command === 'preview';
        const enabled = userConfig.enabled ?? isDev;

        if (!enabled) {
          logger.info('Disabled (set enabled: true to force)');
          return;
        }

        resolvedConfig = {
          enabled,
          storage: userConfig.storage ?? 'local',
          annotationsPath: userConfig.annotationsPath ?? DEFAULT_ANNOTATIONS_PATH,
        };

        // Add Vite plugin for virtual module
        updateConfig({
          vite: {
            plugins: [astroAnnotateVitePlugin(resolvedConfig)],
          },
        });

        // Inject client overlay script
        // At runtime, import.meta.url points to dist/index.js, client bundle is dist/client.js
        const clientPath = resolve(dirname(fileURLToPath(import.meta.url)), 'client.js');
        injectScript('page', `import "${clientPath}";`);

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
