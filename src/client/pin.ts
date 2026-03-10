import type { Annotation } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { escapeHtml } from './utils.js';

interface PinEntry {
  pin: HTMLElement;
  el: Element;
  index: number;
  annotation: Annotation;
}

export class PinManager {
  private entries: Map<string, PinEntry> = new Map();
  private detailPopup: HTMLElement;
  private onChanged: () => void;
  private panelSide: 'left' | 'right' | null = null;

  constructor(
    private shadowRoot: ShadowRoot,
    onChanged: () => void,
  ) {
    this.detailPopup = document.createElement('div');
    this.detailPopup.className = 'aa-pin-detail';
    this.detailPopup.style.display = 'none';
    this.shadowRoot.appendChild(this.detailPopup);
    this.onChanged = onChanged;
  }

  render(annotations: Annotation[], panelSide: 'left' | 'right' | null = null): void {
    this.panelSide = panelSide;
    this.clearPins();

    annotations.forEach((annotation, index) => {
      const el = document.querySelector(annotation.selector);
      if (!el) return;

      const pin = document.createElement('div');
      pin.className = `aa-pin${annotation.status === 'resolved' ? ' aa-resolved' : ''}`;
      pin.innerHTML = `<span class="aa-pin-number">${index + 1}</span>`;

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDetail(annotation, index, el);
      });

      this.shadowRoot.appendChild(pin);
      this.entries.set(annotation.id, { pin, el, index, annotation });
    });

    this.updatePositions();
  }

  updatePositions(): void {
    // Collect all positions first for overlap detection
    const positions: { id: string; top: number; left: number; side: 'left' | 'right' }[] = [];

    for (const [id, entry] of this.entries) {
      const rect = entry.el.getBoundingClientRect();
      const pinTop = Math.max(0, rect.top - 10);
      let pinLeft: number;
      let side: 'left' | 'right';

      // Alternate placement: even indices right side, odd indices left side
      // If panel is open, all pins on opposite side
      if (this.panelSide) {
        // Panel open: all pins on opposite side
        if (this.panelSide === 'right') {
          pinLeft = Math.max(10, rect.left - 32);
          side = 'left';
        } else {
          pinLeft = Math.max(10, rect.right - 24);
          side = 'right';
        }
      } else {
        // No panel: alternate sides
        if (entry.index % 2 === 0) {
          pinLeft = Math.max(10, rect.right - 24);
          side = 'right';
        } else {
          pinLeft = Math.max(10, rect.left - 32);
          side = 'left';
        }
      }

      // FAB collision check (FAB: bottom: 72px, right: 16px, 32×32)
      const fabLeft = window.innerWidth - 48;
      const fabTop = window.innerHeight - 104;
      const fabRight = window.innerWidth - 16;
      const fabBottom = window.innerHeight - 72;

      if (pinTop + 28 > fabTop && pinTop < fabBottom &&
          pinLeft + 28 > fabLeft && pinLeft < fabRight) {
        pinLeft = fabLeft - 32;
      }

      positions.push({ id, top: pinTop, left: pinLeft, side });
    }

    // Group pins by side (left/right of viewport center) and cascade overlaps
    const midX = window.innerWidth / 2;
    const leftGroup = positions.filter(p => p.left < midX);
    const rightGroup = positions.filter(p => p.left >= midX);

    for (const group of [leftGroup, rightGroup]) {
      group.sort((a, b) => a.top - b.top);
      for (let i = 1; i < group.length; i++) {
        if (group[i].top - group[i - 1].top < 40) {
          group[i].top = group[i - 1].top + 40;
        }
      }
    }

    // Apply positions + direction classes
    for (const pos of positions) {
      const entry = this.entries.get(pos.id);
      if (!entry) continue;
      entry.pin.style.position = 'fixed';
      entry.pin.style.top = `${pos.top}px`;
      entry.pin.style.left = `${pos.left}px`;

      // Point toward the annotated element
      entry.pin.classList.toggle('aa-pin-point-left', pos.side === 'right');
      entry.pin.classList.toggle('aa-pin-point-right', pos.side === 'left');
    }
  }

  setPanelSide(panelSide: 'left' | 'right' | null): void {
    this.panelSide = panelSide;
    this.updatePositions();
  }

  private showDetail(annotation: Annotation, index: number, el: Element): void {
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;

    if (top + 250 > window.innerHeight) {
      top = rect.top - 258;
    }
    const detailWidth = Math.min(320, window.innerWidth - 32);
    if (left + detailWidth > window.innerWidth - 16) {
      left = window.innerWidth - detailWidth - 16;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    this.detailPopup.style.top = `${top}px`;
    this.detailPopup.style.left = `${left}px`;
    this.detailPopup.style.display = 'block';

    const date = new Date(annotation.timestamp).toLocaleString();

    this.detailPopup.innerHTML = `
      <div class="aa-pin-detail-header">
        <div>
          <div class="aa-form-header-title">#${index + 1} — ${escapeHtml(annotation.author)}</div>
          <div class="aa-pin-detail-meta">${date} · ${annotation.device} · ${annotation.status}</div>
        </div>
        <button class="aa-form-close" data-action="close-detail">&times;</button>
      </div>
      <div class="aa-pin-detail-body">
        <div class="aa-pin-detail-text">${escapeHtml(annotation.text)}</div>
        <div class="aa-pin-detail-info">
          <span class="aa-inline-tag" title="${escapeHtml(annotation.selector)}">&lt;${escapeHtml(annotation.elementTag)}&gt;</span>
        </div>
      </div>
      <div class="aa-pin-detail-actions">
        ${this.getStatusButtons(annotation)}
      </div>
    `;

    this.detailPopup.querySelector('[data-action="close-detail"]')?.addEventListener('click', () => {
      this.hideDetail();
    });

    this.detailPopup.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const status = (btn as HTMLElement).dataset.status!;
        this.updateStatus(annotation.id, status as Annotation['status']);
      });
    });
  }

  private getStatusButtons(annotation: Annotation): string {
    if (annotation.status === 'open') {
      return `
        <button class="aa-status-btn aa-resolve" data-status="resolved">Done</button>
      `;
    }
    return `<button class="aa-status-btn aa-reopen" data-status="open">Reopen</button>`;
  }

  private async updateStatus(id: string, status: Annotation['status']): Promise<void> {
    try {
      const res = await fetch(`${API_ANNOTATIONS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update');

      this.hideDetail();
      this.onChanged();
    } catch (err) {
      console.error('[astro-annotate] Failed to update annotation:', err);
    }
  }

  hideDetail(): void {
    this.detailPopup.style.display = 'none';
  }

  private clearPins(): void {
    for (const entry of this.entries.values()) {
      entry.pin.remove();
    }
    this.entries.clear();
    this.hideDetail();
  }

  destroy(): void {
    this.clearPins();
    this.detailPopup.remove();
  }
}
