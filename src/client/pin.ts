import type { Annotation } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { escapeHtml, formatTimeAgo } from './utils.js';

interface ClusterEntry {
  wrapper: HTMLElement;
  pin: HTMLElement;
  badge: HTMLElement | null;
  el: Element;
  selector: string;
  annotations: Annotation[];
  clusterIndex: number;
}

export class PinManager {
  private clusters: Map<string, ClusterEntry> = new Map();
  private indexMap: Map<string, number> = new Map();
  private detailPopup: HTMLElement;
  private onChanged: () => void;
  private panelSide: 'left' | 'right' | null = null;
  private activeDetailSelector: string | null = null;

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

    // Build index map (same numbering as panel)
    this.indexMap.clear();
    annotations.forEach((a, i) => {
      this.indexMap.set(a.id, i + 1);
    });

    // Group by selector
    const groups = new Map<string, { el: Element; annotations: Annotation[] }>();
    for (const annotation of annotations) {
      const el = document.querySelector(annotation.selector);
      if (!el) continue;

      const existing = groups.get(annotation.selector);
      if (existing) {
        existing.annotations.push(annotation);
      } else {
        groups.set(annotation.selector, { el, annotations: [annotation] });
      }
    }

    // Create cluster DOM for each group
    let clusterIndex = 0;
    for (const [selector, group] of groups) {
      const wrapper = document.createElement('div');
      wrapper.className = 'aa-pin-wrapper';

      const pin = document.createElement('div');
      const allResolved = group.annotations.every(a => a.status === 'resolved');
      pin.className = `aa-pin${allResolved ? ' aa-resolved' : ''}`;
      wrapper.appendChild(pin);

      let badge: HTMLElement | null = null;
      if (group.annotations.length > 1) {
        badge = document.createElement('span');
        badge.className = 'aa-pin-badge';
        badge.textContent = String(group.annotations.length);
        wrapper.appendChild(badge);
      }

      const entry: ClusterEntry = {
        wrapper,
        pin,
        badge,
        el: group.el,
        selector,
        annotations: group.annotations,
        clusterIndex,
      };

      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (entry.annotations.length === 1) {
          this.showDetail(entry.annotations[0], entry.el);
        } else {
          this.showThread(entry);
        }
      });

      this.shadowRoot.appendChild(wrapper);
      this.clusters.set(selector, entry);
      clusterIndex++;
    }

    this.updatePositions();
  }

  updatePositions(): void {
    const PIN_SIZE = 20;
    const OVERLAP_MIN = 32;

    const positions: { selector: string; top: number; left: number }[] = [];

    for (const [selector, entry] of this.clusters) {
      const rect = entry.el.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight &&
                        rect.right > 0 && rect.left < window.innerWidth;

      if (!isVisible) {
        entry.wrapper.style.display = 'none';
        if (this.activeDetailSelector === selector) {
          this.hideDetail();
        }
        continue;
      }
      entry.wrapper.style.display = '';

      const pinTop = rect.top - 10;
      let pinLeft: number;

      if (this.panelSide) {
        if (this.panelSide === 'right') {
          pinLeft = Math.max(10, rect.left - PIN_SIZE - 4);
        } else {
          pinLeft = Math.max(10, rect.right - PIN_SIZE + 4);
        }
      } else {
        if (entry.clusterIndex % 2 === 0) {
          pinLeft = Math.max(10, rect.right - PIN_SIZE + 4);
        } else {
          pinLeft = Math.max(10, rect.left - PIN_SIZE - 4);
        }
      }

      // FAB collision check (FAB: bottom: 72px, 32×32)
      // FABs move to left side when panel is docked on the right
      const fabOnLeft = this.panelSide === 'right';
      const fabXStart = fabOnLeft ? 16 : window.innerWidth - 48;
      const fabXEnd = fabOnLeft ? 48 : window.innerWidth - 16;
      const fabTop = window.innerHeight - 104;
      const fabBottom = window.innerHeight - 72;

      if (pinTop + PIN_SIZE > fabTop && pinTop < fabBottom &&
          pinLeft + PIN_SIZE > fabXStart && pinLeft < fabXEnd) {
        pinLeft = fabOnLeft ? fabXEnd + 8 : fabXStart - PIN_SIZE - 8;
      }

      positions.push({ selector, top: pinTop, left: pinLeft });
    }

    // Group pins by side and cascade overlaps
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
      const entry = this.clusters.get(pos.selector);
      if (!entry) continue;

      const pinCenterX = pos.left + PIN_SIZE / 2;
      const pinCenterY = pos.top + PIN_SIZE / 2;
      const elRect = entry.el.getBoundingClientRect();
      const elCenterX = elRect.left + elRect.width / 2;
      const elCenterY = elRect.top + elRect.height / 2;

      const angle = Math.atan2(elCenterY - pinCenterY, elCenterX - pinCenterX) * (180 / Math.PI);
      const rotation = angle - 135;

      entry.wrapper.style.top = `${pos.top}px`;
      entry.wrapper.style.left = `${pos.left}px`;
      entry.pin.style.transform = `rotate(${rotation}deg)`;
    }
  }

  setPanelSide(panelSide: 'left' | 'right' | null): void {
    this.panelSide = panelSide;
    this.updatePositions();
  }

  private showDetail(annotation: Annotation, el: Element): void {
    const num = this.indexMap.get(annotation.id) ?? 0;
    const rect = el.getBoundingClientRect();
    this.positionPopup(rect);
    this.activeDetailSelector = annotation.selector;

    const date = new Date(annotation.timestamp).toLocaleString();

    this.detailPopup.innerHTML = `
      <div class="aa-pin-detail-header">
        <div>
          <div class="aa-form-header-title">#${num} — ${escapeHtml(annotation.author)}</div>
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

    this.bindDetailEvents();
  }

  private showThread(cluster: ClusterEntry): void {
    const rect = cluster.el.getBoundingClientRect();
    this.positionPopup(rect);
    this.activeDetailSelector = cluster.selector;

    const tag = cluster.annotations[0]?.elementTag ?? '?';
    const count = cluster.annotations.length;

    const items = cluster.annotations.map(a => {
      const num = this.indexMap.get(a.id) ?? 0;
      const isResolved = a.status === 'resolved';
      return `
        <div class="aa-thread-item${isResolved ? ' aa-thread-resolved' : ''}">
          <div class="aa-thread-item-header">
            <span class="aa-thread-number">#${num}</span>
            <span class="aa-thread-author">${escapeHtml(a.author)}</span>
            <span class="aa-thread-time">${formatTimeAgo(a.timestamp)}</span>
          </div>
          <div class="aa-thread-item-text">${escapeHtml(a.text)}</div>
          <div class="aa-thread-item-actions">
            ${this.getStatusButtons(a)}
          </div>
        </div>
      `;
    }).join('');

    this.detailPopup.innerHTML = `
      <div class="aa-pin-detail-header">
        <div>
          <div class="aa-form-header-title">&lt;${escapeHtml(tag)}&gt; · ${count} annotations</div>
        </div>
        <button class="aa-form-close" data-action="close-detail">&times;</button>
      </div>
      <div class="aa-thread-list">
        ${items}
      </div>
    `;

    this.bindDetailEvents();
  }

  private positionPopup(rect: DOMRect): void {
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
  }

  private bindDetailEvents(): void {
    this.detailPopup.querySelector('[data-action="close-detail"]')?.addEventListener('click', () => {
      this.hideDetail();
    });

    this.detailPopup.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const status = (btn as HTMLElement).dataset.status!;
        const id = (btn as HTMLElement).dataset.id!;
        this.updateStatus(id, status as Annotation['status']);
      });
    });
  }

  private getStatusButtons(annotation: Annotation): string {
    if (annotation.status === 'open') {
      return `<button class="aa-status-btn aa-resolve" data-status="resolved" data-id="${annotation.id}">Done</button>`;
    }
    return `<button class="aa-status-btn aa-reopen" data-status="open" data-id="${annotation.id}">Reopen</button>`;
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
    this.activeDetailSelector = null;
  }

  private clearPins(): void {
    for (const entry of this.clusters.values()) {
      entry.wrapper.remove();
    }
    this.clusters.clear();
    this.hideDetail();
  }

  destroy(): void {
    this.clearPins();
    this.detailPopup.remove();
  }
}
