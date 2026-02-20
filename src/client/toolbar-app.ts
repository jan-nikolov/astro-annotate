import type { DevToolbarApp } from 'astro';

export default {
  init(_canvas, app, _server) {
    let syncing = false;

    // Toolbar icon clicked → notify overlay
    app.onToggled(({ state }) => {
      if (syncing) {
        syncing = false;
        return;
      }
      window.dispatchEvent(new CustomEvent('aa:toggle', { detail: { active: state } }));
    });

    // Overlay changed state (keyboard shortcut) → sync toolbar icon
    window.addEventListener('aa:state-changed', ((e: CustomEvent) => {
      syncing = true;
      app.toggleState({ state: e.detail.active });
    }) as EventListener);

    // Overlay reports annotation count → toggle notification dot
    window.addEventListener('aa:count', ((e: CustomEvent) => {
      const count = e.detail.count;
      app.toggleNotification(count > 0 ? { state: true, level: 'info' } : { state: false });
    }) as EventListener);
  },
} satisfies DevToolbarApp;
