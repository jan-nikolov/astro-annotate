import type { Annotation } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { escapeHtml } from './utils.js';

export class PinManager {
  private pins: HTMLElement[] = [];
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

      // Position pin — shift away from panel side and FAB
      const updatePosition = () => {
        const rect = el.getBoundingClientRect();
        pin.style.position = 'fixed';
        const pinTop = Math.max(0, rect.top - 10);
        let pinLeft: number;
        if (this.panelSide === 'right') {
          pinLeft = Math.max(10, rect.left - 32);
        } else {
          pinLeft = Math.max(10, rect.right - 24);
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

        pin.style.top = `${pinTop}px`;
        pin.style.left = `${pinLeft}px`;
      };
      updatePosition();

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDetail(annotation, index, el);
      });

      this.shadowRoot.appendChild(pin);
      this.pins.push(pin);

      // Update position on scroll/resize
      const observer = new IntersectionObserver(() => updatePosition(), { threshold: 0 });
      observer.observe(el);
    });
  }

  private showDetail(annotation: Annotation, index: number, el: Element): void {
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;

    if (top + 250 > window.innerHeight) {
      top = rect.top - 258;
    }
    if (left + 320 > window.innerWidth) {
      left = window.innerWidth - 330;
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
          <div class="aa-pin-detail-selector">${escapeHtml(annotation.selector)}</div>
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
    this.pins.forEach((pin) => pin.remove());
    this.pins = [];
    this.hideDetail();
  }

  destroy(): void {
    this.clearPins();
    this.detailPopup.remove();
  }
}
