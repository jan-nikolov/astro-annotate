import { SHADOW_ROOT_ID } from '../constants.js';
import { Overlay } from './overlay.js';

let overlay: Overlay | null = null;

function init(): void {
  // Clean up previous instance (View Transitions)
  const existing = document.getElementById(SHADOW_ROOT_ID);
  if (existing) {
    existing.remove();
    overlay = null;
  }

  overlay = new Overlay();
}

// Support View Transitions (SPA navigation)
document.addEventListener('astro:page-load', init);

// Fallback for non-View-Transitions pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only init if astro:page-load hasn't fired yet
    if (!document.getElementById(SHADOW_ROOT_ID)) {
      init();
    }
  });
} else {
  if (!document.getElementById(SHADOW_ROOT_ID)) {
    init();
  }
}
