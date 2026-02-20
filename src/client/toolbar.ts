const ANNOTATE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="aa-toolbar-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="12" y1="6" x2="12" y2="12"/></svg>`;

export class Toolbar {
  private el: HTMLElement;
  private label: HTMLElement;
  private badge: HTMLElement;
  private active = false;
  private onToggle: (active: boolean) => void;

  constructor(shadowRoot: ShadowRoot, onToggle: (active: boolean) => void) {
    this.onToggle = onToggle;

    this.el = document.createElement('div');
    this.el.className = 'aa-toolbar';

    this.el.innerHTML = ANNOTATE_ICON;

    this.label = document.createElement('span');
    this.label.className = 'aa-toolbar-label';
    this.label.textContent = 'Annotate';
    this.el.appendChild(this.label);

    this.badge = document.createElement('span');
    this.badge.className = 'aa-badge';
    this.badge.textContent = '0';
    this.badge.style.display = 'none';
    this.el.appendChild(this.badge);

    this.el.addEventListener('click', () => {
      this.toggle();
    });

    shadowRoot.appendChild(this.el);
  }

  toggle(): void {
    this.active = !this.active;
    this.el.classList.toggle('aa-active', this.active);
    this.label.textContent = this.active ? 'Stop' : 'Annotate';
    this.onToggle(this.active);
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      this.el.classList.remove('aa-active');
      this.label.textContent = 'Annotate';
    }
  }

  updateCount(count: number): void {
    this.badge.textContent = String(count);
    this.badge.style.display = count > 0 ? 'flex' : 'none';
  }

  destroy(): void {
    this.el.remove();
  }
}
