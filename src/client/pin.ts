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
      pin.innerHTML = '';

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
    const PIN_SIZE = 20;
    const OVERLAP_MIN = 32;

    // Collect all positions first for overlap detection
    const positions: { id: string; top: number; left: number }[] = [];

    for (const [id, entry] of this.entries) {
      const rect = entry.el.getBoundingClientRect();
      const pinTop = Math.max(0, rect.top - 10);
      let pinLeft: number;

      // Alternate placement: even indices right side, odd indices left side
      // If panel is docked, all pins on opposite side
      if (this.panelSide) {
        if (this.panelSide === 'right') {
          pinLeft = Math.max(10, rect.left - PIN_SIZE - 4);
        } else {
          pinLeft = Math.max(10, rect.right - PIN_SIZE + 4);
        }
      } else {
        if (entry.index % 2 === 0) {
          pinLeft = Math.max(10, rect.right - PIN_SIZE + 4);
        } else {
          pinLeft = Math.max(10, rect.left - PIN_SIZE - 4);
        }
      }

      // FAB collision check (FAB: bottom: 72px, right: 16px, 32×32)
      const fabLeft = window.innerWidth - 48;
      const fabTop = window.innerHeight - 104;
      const fabRight = window.innerWidth - 16;
      const fabBottom = window.innerHeight - 72;

      if (pinTop + PIN_SIZE > fabTop && pinTop < fabBottom &&
          pinLeft + PIN_SIZE > fabLeft && pinLeft < fabRight) {
        pinLeft = fabLeft - PIN_SIZE - 8;
      }

      positions.push({ id, top: pinTop, left: pinLeft });
    }

    // Group pins by side (left/right of viewport center) and cascade overlaps
    const midX = window.innerWidth / 2;
    const leftGroup = positions.filter(p => p.left < midX);
    const rightGroup = positions.filter(p => p.left >= midX);

    for (const group of [leftGroup, rightGroup]) {
      group.sort((a, b) => a.top - b.top);
      for (let i = 1; i < group.length; i++) {
        if (group[i].top - group[i - 1].top < OVERLAP_MIN) {
          group[i].top = group[i - 1].top + OVERLAP_MIN;
        }
      }
    }

    // Apply positions + atan2-based tilt
    for (const pos of positions) {
      const entry = this.entries.get(pos.id);
      if (!entry) continue;

      const pinCenterX = pos.left + PIN_SIZE / 2;
      const pinCenterY = pos.top + PIN_SIZE / 2;
      const elRect = entry.el.getBoundingClientRect();
      const elCenterX = elRect.left + elRect.width / 2;
      const elCenterY = elRect.top + elRect.height / 2;

      // atan2 angle from pin center to element center (screen coords: y-down)
      const angle = Math.atan2(elCenterY - pinCenterY, elCenterX - pinCenterX) * (180 / Math.PI);
      // Teardrop sharp corner at border-radius 0 (bottom-left) = 135° in screen coords
      const rotation = angle - 135;

      entry.pin.style.position = 'fixed';
      entry.pin.style.top = `${pos.top}px`;
      entry.pin.style.left = `${pos.left}px`;
      entry.pin.style.transform = `rotate(${rotation}deg)`;
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
