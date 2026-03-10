import type { Annotation } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { escapeHtml, formatTimeAgo } from './utils.js';
import { DragResize } from './drag.js';

type FilterValue = 'all' | 'open' | 'resolved';
type SideValue = 'right' | 'left';
type PanelMode = 'docked' | 'floating';

interface FloatingState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class AnnotationPanel {
  private container: HTMLElement;
  private contentWrapper: HTMLElement;
  private resizeHandle: HTMLElement;
  private fab: HTMLElement;
  private annotateFab: HTMLElement;
  private label: HTMLElement;
  private annotateLabel: HTMLElement;
  private snapZoneLeft: HTMLElement;
  private snapZoneRight: HTMLElement;
  private visible = false;
  private filter: FilterValue = 'open';
  private side: SideValue = 'right';
  private mode: PanelMode = 'docked';
  private floatingState: FloatingState = { x: 100, y: 100, width: 360, height: 500 };
  private editingId: string | null = null;
  private annotations: Annotation[] = [];
  private indexMap: Map<string, number> = new Map();
  private onChanged: () => void;
  private onVisibilityChanged: () => void;
  private onExitAnnotationMode: (() => void) | null = null;
  private onEnterAnnotationMode: (() => void) | null = null;
  private annotationModeActive = false;
  private dragResize: DragResize | null = null;

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

    // Content wrapper (innerHTML target — survives resize handle)
    this.contentWrapper = document.createElement('div');
    this.contentWrapper.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;';
    this.container.appendChild(this.contentWrapper);

    // Resize handle (sibling of content — survives re-renders)
    this.resizeHandle = document.createElement('div');
    this.resizeHandle.className = 'aa-panel-resize';
    this.resizeHandle.style.display = 'none';
    this.container.appendChild(this.resizeHandle);

    this.shadowRoot.appendChild(this.container);

    // Snap zone indicators
    this.snapZoneLeft = document.createElement('div');
    this.snapZoneLeft.className = 'aa-snap-zone aa-snap-zone-left';
    this.snapZoneLeft.style.display = 'none';
    this.shadowRoot.appendChild(this.snapZoneLeft);

    this.snapZoneRight = document.createElement('div');
    this.snapZoneRight.className = 'aa-snap-zone aa-snap-zone-right';
    this.snapZoneRight.style.display = 'none';
    this.shadowRoot.appendChild(this.snapZoneRight);

    // Annotate FAB (upper button — toggles annotation mode)
    this.annotateFab = document.createElement('button');
    this.annotateFab.className = 'aa-annotate-fab';
    this.annotateFab.addEventListener('click', () => {
      if (this.annotationModeActive && this.onExitAnnotationMode) {
        this.onExitAnnotationMode();
      } else if (this.onEnterAnnotationMode) {
        this.onEnterAnnotationMode();
      }
    });
    this.shadowRoot.appendChild(this.annotateFab);

    // Panel FAB (lower button — toggles panel)
    this.fab = document.createElement('button');
    this.fab.className = 'aa-panel-fab';
    this.fab.addEventListener('click', () => {
      this.toggle();
    });
    this.shadowRoot.appendChild(this.fab);

    // Shortcut labels — fixed per button
    this.annotateLabel = document.createElement('div');
    this.annotateLabel.className = 'aa-fab-label aa-fab-label-upper';
    this.annotateLabel.textContent = 'Alt+C';
    this.shadowRoot.appendChild(this.annotateLabel);

    this.label = document.createElement('div');
    this.label.className = 'aa-fab-label aa-fab-label-lower';
    this.label.textContent = 'Alt+L';
    this.shadowRoot.appendChild(this.label);

    this.renderFab();
  }

  show(): void {
    this.visible = true;
    this.container.style.display = 'flex';
    this.fab.classList.add('aa-fab-panel-open');
    this.renderFab();
    this.render();
    this.applyMode();
    this.updateFabSide();
    this.onVisibilityChanged();
  }

  hide(): void {
    this.visible = false;
    this.editingId = null;
    this.container.style.display = 'none';
    this.hideSnapZones();
    this.fab.classList.remove('aa-fab-panel-open');
    this.renderFab();
    this.updateFabSide();
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

  getMode(): PanelMode {
    return this.mode;
  }

  setAnnotationMode(active: boolean, onExitMode?: () => void): void {
    this.annotationModeActive = active;
    this.onExitAnnotationMode = onExitMode ?? null;
    if (active) {
      this.annotateFab.classList.add('aa-fab-active');
    } else {
      this.annotateFab.classList.remove('aa-fab-active');
    }
    this.renderFab();
  }

  setOnEnterAnnotationMode(callback: () => void): void {
    this.onEnterAnnotationMode = callback;
  }

  setSide(side: SideValue): void {
    this.side = side;
    if (this.visible) this.render();
    this.applyMode();
    this.onVisibilityChanged();
  }

  getState(): { visible: boolean; filter: FilterValue; side: SideValue; mode: PanelMode; floating: FloatingState } {
    return { visible: this.visible, filter: this.filter, side: this.side, mode: this.mode, floating: this.floatingState };
  }

  restoreState(state: { visible: boolean; filter: string; side: string; mode?: string; floating?: FloatingState }): void {
    this.filter = (state.filter as FilterValue) || 'open';
    this.side = (state.side as SideValue) || 'right';
    this.mode = (state.mode as PanelMode) || 'docked';
    if (state.floating) {
      this.floatingState = state.floating;
      this.clampFloatingToViewport();
    }
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
    if (this.dragResize) {
      this.dragResize.destroy();
      this.dragResize = null;
    }
    this.container.removeEventListener('click', this.onClick);
    this.container.removeEventListener('keydown', this.onKeyDown);
    this.container.remove();
    this.fab.remove();
    this.annotateFab.remove();
    this.annotateLabel.remove();
    this.label.remove();
    this.snapZoneLeft.remove();
    this.snapZoneRight.remove();
  }

  // --- Private ---

  private isMobile(): boolean {
    return window.innerWidth < 400;
  }

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

    const sideIcon = this.side === 'right'
      ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="3" y1="3" x2="3" y2="13"/><polyline points="12,5 8,8 12,11"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="13" y1="3" x2="13" y2="13"/><polyline points="4,5 8,8 4,11"/></svg>';

    this.contentWrapper.innerHTML = `
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
      const textarea = this.contentWrapper.querySelector('.aa-panel-edit-textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, window.innerHeight * 0.4) + 'px';
        }, 30);
      }
    }

    this.setupDragResize();
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
          <span class="aa-panel-item-time">${formatTimeAgo(annotation.timestamp)}</span>
        </div>
        <span class="aa-inline-tag" title="${escapeHtml(annotation.selector)}">&lt;${escapeHtml(annotation.elementTag)}&gt;</span>
        ${textBlock}
      </div>
    `;
  }

  private renderFab(): void {
    const openCount = this.countByStatus('open');
    const badge = openCount > 0
      ? `<span class="aa-panel-fab-badge">${openCount}</span>`
      : '';

    // Lower button: X when panel open, speech bubble + badge when closed
    if (this.visible) {
      this.fab.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
        </svg>`;
    } else {
      this.fab.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h12v8H5l-3 3V3z"/>
        </svg>${badge}`;
    }

    // Upper button: crosshair (normal) or X (active)
    if (this.annotationModeActive) {
      this.annotateFab.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
        </svg>`;
    } else {
      this.annotateFab.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <circle cx="8" cy="8" r="5"/><line x1="8" y1="1" x2="8" y2="4"/><line x1="8" y1="12" x2="8" y2="15"/><line x1="1" y1="8" x2="4" y2="8"/><line x1="12" y1="8" x2="15" y2="8"/>
        </svg>`;
    }
  }

  // --- Mode management ---

  private applyMode(): void {
    if (this.isMobile()) {
      this.mode = 'docked';
    }

    if (this.mode === 'floating') {
      this.container.className = 'aa-panel aa-panel-floating';
      this.container.style.left = `${this.floatingState.x}px`;
      this.container.style.top = `${this.floatingState.y}px`;
      this.container.style.width = `${this.floatingState.width}px`;
      this.container.style.height = `${this.floatingState.height}px`;
      this.container.style.right = 'auto';
      this.resizeHandle.style.display = 'block';
    } else {
      this.container.className = `aa-panel${this.side === 'left' ? ' aa-panel-left' : ''}`;
      this.clearInlineStyles();
      this.resizeHandle.style.display = 'none';
    }
    this.updateFabSide();
  }

  private clearInlineStyles(): void {
    this.container.style.left = '';
    this.container.style.top = '';
    this.container.style.width = '';
    this.container.style.height = '';
    this.container.style.right = '';
  }

  private switchToFloating(): void {
    const rect = this.container.getBoundingClientRect();
    this.mode = 'floating';
    this.floatingState = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
    this.applyMode();
  }

  private snapToDocked(side: SideValue): void {
    this.mode = 'docked';
    this.side = side;

    this.container.className = `aa-panel aa-panel-snapping${side === 'left' ? ' aa-panel-left' : ''}`;
    this.clearInlineStyles();
    this.resizeHandle.style.display = 'none';

    const cleanup = () => {
      this.container.classList.remove('aa-panel-snapping');
    };
    this.container.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 350);

    this.updateFabSide();
    this.onVisibilityChanged();
  }

  // --- Snap zones ---

  private showSnapZones(): void {
    this.snapZoneLeft.style.display = 'block';
    this.snapZoneRight.style.display = 'block';
  }

  private hideSnapZones(): void {
    this.snapZoneLeft.style.display = 'none';
    this.snapZoneRight.style.display = 'none';
    this.snapZoneLeft.classList.remove('aa-snap-active');
    this.snapZoneRight.classList.remove('aa-snap-active');
  }

  private updateSnapZoneHighlight(x: number): void {
    const SNAP_THRESHOLD = 60;
    const rect = this.container.getBoundingClientRect();
    this.snapZoneLeft.classList.toggle('aa-snap-active', x < SNAP_THRESHOLD);
    this.snapZoneRight.classList.toggle('aa-snap-active', rect.right > window.innerWidth - SNAP_THRESHOLD);
  }

  // --- DragResize setup ---

  private setupDragResize(): void {
    if (this.dragResize) {
      this.dragResize.destroy();
      this.dragResize = null;
    }

    if (this.isMobile()) return;

    const header = this.contentWrapper.querySelector('.aa-panel-header') as HTMLElement | null;
    if (!header) return;

    this.dragResize = new DragResize(
      this.container,
      header,
      this.resizeHandle,
      { minWidth: 280, minHeight: 200, visibleMargin: 60 },
      {
        onDragStart: () => {
          if (this.mode === 'docked') {
            this.switchToFloating();
          }
          this.container.classList.add('aa-panel-no-transition');
          this.showSnapZones();
        },
        onDrag: (x, y) => {
          this.container.style.left = `${x}px`;
          this.container.style.top = `${y}px`;
          this.floatingState.x = x;
          this.floatingState.y = y;
          this.updateSnapZoneHighlight(x);
        },
        onDragEnd: (x, _y) => {
          this.container.classList.remove('aa-panel-no-transition');
          this.hideSnapZones();

          const SNAP_THRESHOLD = 60;
          const rect = this.container.getBoundingClientRect();

          if (x < SNAP_THRESHOLD) {
            this.snapToDocked('left');
          } else if (rect.right > window.innerWidth - SNAP_THRESHOLD) {
            this.snapToDocked('right');
          } else {
            this.onVisibilityChanged();
          }
        },
        onResizeStart: () => {
          this.container.classList.add('aa-panel-no-transition');
        },
        onResize: (width, height) => {
          this.container.style.width = `${width}px`;
          this.container.style.height = `${height}px`;
          this.floatingState.width = width;
          this.floatingState.height = height;
        },
        onResizeEnd: () => {
          this.container.classList.remove('aa-panel-no-transition');
          this.onVisibilityChanged();
        },
      },
    );

    this.dragResize.enable();
  }

  private clampFloatingToViewport(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 60;
    this.floatingState.x = Math.max(MARGIN - this.floatingState.width, Math.min(this.floatingState.x, vw - MARGIN));
    this.floatingState.y = Math.max(0, Math.min(this.floatingState.y, vh - MARGIN));
    this.floatingState.width = Math.min(this.floatingState.width, vw - 32);
    this.floatingState.height = Math.min(this.floatingState.height, vh - 32);
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
        if (this.mode === 'floating') {
          this.snapToDocked(this.side);
        } else {
          this.applyMode();
          this.onVisibilityChanged();
        }
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
    const textarea = this.contentWrapper.querySelector(`.aa-panel-edit-textarea[data-id="${id}"]`) as HTMLTextAreaElement | null;
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

  private updateFabSide(): void {
    const moveLeft = this.visible && this.mode === 'docked' && this.side === 'right';
    this.fab.classList.toggle('aa-fab-left', moveLeft);
    this.annotateFab.classList.toggle('aa-fab-left', moveLeft);
    this.annotateLabel.classList.toggle('aa-fab-label-left', moveLeft);
    this.label.classList.toggle('aa-fab-label-left', moveLeft);
  }

  // --- Helpers ---

}
