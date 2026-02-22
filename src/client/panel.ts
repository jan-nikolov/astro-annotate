import type { Annotation } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { escapeHtml } from './utils.js';

type FilterValue = 'all' | 'open' | 'resolved';
type SideValue = 'right' | 'left';

export class AnnotationPanel {
  private container: HTMLElement;
  private fab: HTMLElement;
  private visible = false;
  private filter: FilterValue = 'open';
  private side: SideValue = 'right';
  private editingId: string | null = null;
  private annotations: Annotation[] = [];
  private indexMap: Map<string, number> = new Map();
  private onChanged: () => void;
  private onVisibilityChanged: () => void;

  constructor(
    private shadowRoot: ShadowRoot,
    onChanged: () => void,
    onVisibilityChanged: () => void = () => {},
  ) {
    this.onChanged = onChanged;
    this.onVisibilityChanged = onVisibilityChanged;

    // Panel container
    this.container = document.createElement('div');
    this.container.className = 'aa-panel';
    this.container.style.display = 'none';
    this.container.addEventListener('click', this.onClick);
    this.container.addEventListener('keydown', this.onKeyDown);
    this.shadowRoot.appendChild(this.container);

    // Floating action button
    this.fab = document.createElement('button');
    this.fab.className = 'aa-panel-fab';
    this.fab.addEventListener('click', () => this.toggle());
    this.shadowRoot.appendChild(this.fab);

    this.renderFab();
  }

  show(): void {
    this.visible = true;
    this.container.style.display = 'flex';
    this.render();
    this.onVisibilityChanged();
  }

  hide(): void {
    this.visible = false;
    this.editingId = null;
    this.container.style.display = 'none';
    this.onVisibilityChanged();
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  isEditing(): boolean {
    return this.editingId !== null;
  }

  getSide(): SideValue {
    return this.side;
  }

  getState(): { visible: boolean; filter: FilterValue; side: SideValue } {
    return { visible: this.visible, filter: this.filter, side: this.side };
  }

  restoreState(state: { visible: boolean; filter: string; side: string }): void {
    this.filter = (state.filter as FilterValue) || 'open';
    this.side = (state.side as SideValue) || 'right';
    if (state.visible) {
      this.show();
    }
  }

  update(annotations: Annotation[]): void {
    this.annotations = annotations;
    this.rebuildIndexMap();
    this.renderFab();
    if (this.visible) {
      this.render();
    }
  }

  destroy(): void {
    this.container.removeEventListener('click', this.onClick);
    this.container.removeEventListener('keydown', this.onKeyDown);
    this.container.remove();
    this.fab.remove();
  }

  // --- Private ---

  private rebuildIndexMap(): void {
    this.indexMap.clear();
    this.annotations.forEach((a, i) => {
      this.indexMap.set(a.id, i + 1);
    });
  }

  private getFiltered(): Annotation[] {
    if (this.filter === 'all') return this.annotations;
    return this.annotations.filter((a) => a.status === this.filter);
  }

  private countByStatus(status: 'open' | 'resolved'): number {
    return this.annotations.filter((a) => a.status === status).length;
  }

  private render(): void {
    const filtered = this.getFiltered();
    const openCount = this.countByStatus('open');
    const resolvedCount = this.countByStatus('resolved');
    const totalCount = this.annotations.length;

    this.container.className = `aa-panel${this.side === 'left' ? ' aa-panel-left' : ''}`;

    const sideIcon = this.side === 'right'
      ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="3" y1="3" x2="3" y2="13"/><polyline points="12,5 8,8 12,11"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="13" y1="3" x2="13" y2="13"/><polyline points="4,5 8,8 4,11"/></svg>';

    this.container.innerHTML = `
      <div class="aa-panel-header">
        <span class="aa-panel-title">Annotations (${totalCount})</span>
        <div class="aa-panel-header-actions">
          <button data-action="toggle-side" title="Move panel">${sideIcon}</button>
          <button data-action="close-panel" title="Close panel">&times;</button>
        </div>
      </div>
      <div class="aa-panel-filters">
        <button data-action="filter" data-filter="open" class="${this.filter === 'open' ? 'aa-active' : ''}">Open (${openCount})</button>
        <button data-action="filter" data-filter="resolved" class="${this.filter === 'resolved' ? 'aa-active' : ''}">Resolved (${resolvedCount})</button>
        <button data-action="filter" data-filter="all" class="${this.filter === 'all' ? 'aa-active' : ''}">All (${totalCount})</button>
      </div>
      ${this.filter === 'open' && openCount > 0 ? `
        <div class="aa-panel-bulk">
          <button class="aa-panel-bulk-btn" data-action="bulk-resolve">Mark all as done</button>
        </div>
      ` : ''}
      <div class="aa-panel-list">
        ${filtered.length > 0
          ? filtered.map((a) => this.renderItem(a)).join('')
          : '<div class="aa-panel-empty">No annotations match this filter.</div>'
        }
      </div>
    `;

    // Focus textarea if editing + auto-grow
    if (this.editingId) {
      const textarea = this.container.querySelector('.aa-panel-edit-textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, window.innerHeight * 0.4) + 'px';
        }, 30);
      }
    }
  }

  private renderItem(annotation: Annotation): string {
    const num = this.indexMap.get(annotation.id) ?? 0;
    const isResolved = annotation.status === 'resolved';
    const isEditing = this.editingId === annotation.id;

    const numberClass = isResolved ? 'aa-panel-item-number aa-panel-item-number-resolved' : 'aa-panel-item-number';

    const textBlock = isEditing
      ? `<textarea class="aa-panel-edit-textarea" data-id="${annotation.id}">${escapeHtml(annotation.text)}</textarea>
         <div class="aa-panel-item-actions">
           <button data-action="save-edit" data-id="${annotation.id}">Save</button>
           <button data-action="cancel-edit" data-id="${annotation.id}">Cancel</button>
         </div>`
      : `<div class="aa-panel-item-text">${escapeHtml(annotation.text)}</div>
         <div class="aa-panel-item-actions">
           <button data-action="locate" data-id="${annotation.id}" data-selector="${escapeHtml(annotation.selector)}">Locate</button>
           <button data-action="edit-inline" data-id="${annotation.id}">Edit</button>
           ${isResolved
             ? `<button data-action="reopen" data-id="${annotation.id}">Reopen</button>`
             : `<button data-action="resolve" data-id="${annotation.id}">Done</button>`
           }
         </div>`;

    return `
      <div class="aa-panel-item${isResolved ? ' aa-panel-item-resolved' : ''}" data-id="${annotation.id}">
        <div class="aa-panel-item-header">
          <span class="${numberClass}">#${num}</span>
          <span class="aa-panel-item-author">${escapeHtml(annotation.author)}</span>
          <span class="aa-panel-item-time">${this.formatTimeAgo(annotation.timestamp)}</span>
        </div>
        <div class="aa-panel-item-selector">${escapeHtml(annotation.selector)}</div>
        ${textBlock}
      </div>
    `;
  }

  private renderFab(): void {
    const openCount = this.countByStatus('open');
    const badge = openCount > 0
      ? `<span class="aa-panel-fab-badge">${openCount}</span>`
      : '';
    this.fab.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="10" y2="12"/>
      </svg>
      ${badge}
    `;
  }

  // --- Event delegation ---

  private onClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    const actionEl = target.closest<HTMLElement>('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const id = actionEl.dataset.id;

    switch (action) {
      case 'close-panel':
        this.hide();
        break;
      case 'toggle-side':
        this.side = this.side === 'right' ? 'left' : 'right';
        this.render();
        this.onVisibilityChanged();
        break;
      case 'filter':
        this.filter = (actionEl.dataset.filter as FilterValue) || 'all';
        this.editingId = null;
        this.render();
        break;
      case 'bulk-resolve':
        this.bulkResolve(actionEl);
        break;
      case 'locate':
        if (actionEl.dataset.selector) this.locateElement(actionEl.dataset.selector);
        break;
      case 'edit-inline':
        if (id) {
          this.editingId = id;
          this.render();
        }
        break;
      case 'cancel-edit':
        this.editingId = null;
        this.render();
        break;
      case 'save-edit':
        if (id) this.saveEdit(id);
        break;
      case 'resolve':
        if (id) this.updateStatus(id, 'resolved');
        break;
      case 'reopen':
        if (id) this.updateStatus(id, 'open');
        break;
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    // Ctrl+Enter inside edit textarea -> save
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && this.editingId) {
      e.preventDefault();
      this.saveEdit(this.editingId);
    }
  };

  // --- Actions ---

  private async updateStatus(id: string, status: Annotation['status']): Promise<void> {
    try {
      const res = await fetch(`${API_ANNOTATIONS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      this.onChanged();
    } catch (err) {
      console.error('[astro-annotate] Failed to update annotation:', err);
    }
  }

  private async saveEdit(id: string): Promise<void> {
    const textarea = this.container.querySelector(`.aa-panel-edit-textarea[data-id="${id}"]`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) return;

    try {
      const res = await fetch(`${API_ANNOTATIONS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to update');
      this.editingId = null;
      this.onChanged();
    } catch (err) {
      console.error('[astro-annotate] Failed to update annotation text:', err);
    }
  }

  private async bulkResolve(btn: HTMLElement): Promise<void> {
    const openAnnotations = this.annotations.filter((a) => a.status === 'open');
    const total = openAnnotations.length;
    if (total === 0) return;

    btn.setAttribute('disabled', '');

    // Sequential PATCH: intentional — local JSON storage has no write locking,
    // so parallel writes would cause data loss via read-modify-write races.
    for (let i = 0; i < openAnnotations.length; i++) {
      btn.textContent = `Resolving ${i + 1}/${total}...`;
      try {
        const res = await fetch(`${API_ANNOTATIONS}/${openAnnotations[i].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'resolved' }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } catch (err) {
        console.error('[astro-annotate] Failed to resolve annotation:', err);
      }
    }

    this.onChanged();
  }

  private locateElement(selector: string): void {
    const el = document.querySelector(selector);
    if (!el) return;

    el.scrollIntoView({ behavior: 'instant', block: 'center' });

    // Flash highlight — rendered in Shadow DOM to avoid host CSS interference
    // and ensure cleanup on destroy/view transitions
    const flash = document.createElement('div');
    const rect = el.getBoundingClientRect();
    Object.assign(flash.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: '2px solid #e94560',
      background: 'rgba(233, 69, 96, 0.12)',
      borderRadius: '3px',
      pointerEvents: 'none',
      zIndex: '2147483646',
      transition: 'opacity 0.6s ease',
    });
    this.shadowRoot.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
    }, 700);
    setTimeout(() => {
      flash.remove();
    }, 1300);
  }

  // --- Helpers ---

  private formatTimeAgo(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return 'unknown';
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

}
