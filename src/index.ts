import type { AstroAnnotateConfig } from './types.js';
import { createIntegration } from './integration/index.js';

export default function astroAnnotate(config: AstroAnnotateConfig = {}) {
  return createIntegration(config);
}

export type { AstroAnnotateConfig, Annotation, AnnotationsFile } from './types.js';
