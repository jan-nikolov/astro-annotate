import { SHADOW_ROOT_ID } from '../constants.js';
import { Overlay } from './overlay.js';

let overlay: Overlay | null = null;
const PANEL_STATE_KEY = 'aa-panel-state';

function savePanelState(state: { visible: boolean; filter: string; side: string }): void {
  sessionStorage.setItem(PANEL_STATE_KEY, JSON.stringify(state));
}

function init(): void {
  // Preserve panel state before destroying (View Transitions)
  if (overlay) {
    savePanelState(overlay.getPanelState());
    overlay.destroy();
    overlay = null;
  }

  overlay = new Overlay();

  // Restore from sessionStorage (works for both VT and full reload)
  const saved = sessionStorage.getItem(PANEL_STATE_KEY);
  if (saved) {
    try {
      overlay.restorePanelState(JSON.parse(saved));
    } catch { /* ignore corrupt data */ }
  }
}

// Save panel state before full page reload (F5, tab close)
window.addEventListener('beforeunload', () => {
  if (overlay) {
    savePanelState(overlay.getPanelState());
  }
});

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
