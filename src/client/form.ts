import type { CreateAnnotationPayload } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { generateSelector, getElementText } from './selector.js';
import { escapeHtml } from './utils.js';

export class AnnotationForm {
  private container: HTMLElement;
  private onSubmitted: () => void;
  private onClosed: () => void;

  constructor(
    private shadowRoot: ShadowRoot,
    onSubmitted: () => void,
    onClosed: () => void,
    private devMode: boolean,
  ) {
    this.container = document.createElement('div');
    this.container.className = 'aa-inline-input';
    this.container.style.display = 'none';
    this.shadowRoot.appendChild(this.container);
    this.onSubmitted = onSubmitted;
    this.onClosed = onClosed;
  }

  show(target: Element): void {
    const selector = generateSelector(target);
    const elementTag = target.tagName.toLowerCase();
    const elementText = getElementText(target);
    const rect = target.getBoundingClientRect();

    // Determine placement: below or above element
    const inputHeight = this.devMode ? 140 : 180; // estimated height
    const gap = 12;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const placeAbove = spaceBelow < inputHeight && rect.top > inputHeight + gap;

    // Horizontal position: center on element, clamped to viewport
    const inputWidth = Math.min(320, window.innerWidth - 32);
    const elementCenter = rect.left + rect.width / 2;
    let left = elementCenter - inputWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - inputWidth - 16));

    // Vertical position
    let top: number;
    if (placeAbove) {
      top = rect.top - inputHeight - gap;
    } else {
      top = rect.bottom + gap;
    }
    top = Math.max(16, Math.min(top, window.innerHeight - inputHeight - 16));

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
    this.container.style.width = `${inputWidth}px`;
    this.container.style.display = 'flex';
    this.container.className = `aa-inline-input${placeAbove ? ' aa-inline-above' : ''}`;

    // Arrow position (points to element center)
    const arrowLeft = Math.max(16, Math.min(elementCenter - left - 6, inputWidth - 28));
    const arrowClass = placeAbove ? 'aa-inline-arrow aa-inline-arrow-bottom' : 'aa-inline-arrow aa-inline-arrow-top';

    // Build tag label (tag only, selector shown as tooltip)
    const tagLabel = `&lt;${escapeHtml(elementTag)}&gt;`;

    this.container.innerHTML = `
      <div class="${arrowClass}" style="left: ${arrowLeft}px"></div>
      <div class="aa-inline-tag" title="${escapeHtml(selector)}">${tagLabel}</div>
      ${this.devMode ? '' : '<input class="aa-inline-author" type="text" placeholder="Your name" data-field="author" />'}
      <textarea class="aa-inline-textarea" placeholder="What should change?" data-field="text" rows="1"></textarea>
      <div class="aa-inline-footer">
        <span class="aa-inline-hint">Ctrl+Enter</span>
        <button class="aa-inline-submit" data-action="submit" title="Submit">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
          </svg>
        </button>
      </div>
    `;

    // Auto-resize textarea + reposition if overflowing viewport
    const textarea = this.container.querySelector('[data-field="text"]') as HTMLTextAreaElement;
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
      const containerRect = this.container.getBoundingClientRect();
      if (containerRect.bottom > window.innerHeight - 16) {
        const overflow = containerRect.bottom - window.innerHeight + 16;
        this.container.style.top = (parseFloat(this.container.style.top) - overflow) + 'px';
      }
    });

    // Focus textarea (or author field if present)
    const firstInput = this.devMode
      ? textarea
      : this.container.querySelector('[data-field="author"]') as HTMLInputElement;
    setTimeout(() => firstInput?.focus(), 50);

    // Submit button
    const submitBtn = this.container.querySelector('[data-action="submit"]') as HTMLButtonElement;
    submitBtn.addEventListener('click', () => {
      this.submit(selector, elementTag, elementText);
    });

    // Keyboard: Ctrl+Enter to submit, Escape to close
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.submit(selector, elementTag, elementText);
      }
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.hide();
      }
    });
  }

  private async submit(selector: string, elementTag: string, elementText: string): Promise<void> {
    const text = (this.container.querySelector('[data-field="text"]') as HTMLTextAreaElement)?.value?.trim();
    const author = this.devMode
      ? 'Developer'
      : (this.container.querySelector('[data-field="author"]') as HTMLInputElement)?.value?.trim();

    if (!text) return;

    const submitBtn = this.container.querySelector('[data-action="submit"]') as HTMLButtonElement;
    submitBtn.disabled = true;

    const payload: CreateAnnotationPayload = {
      page: window.location.pathname,
      selector,
      elementTag,
      elementText,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      text,
      author: author || 'Anonymous',
    };

    try {
      const res = await fetch(API_ANNOTATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      this.hide();
      this.onSubmitted();
    } catch (err) {
      submitBtn.disabled = false;
      console.error('[astro-annotate] Failed to save annotation:', err);
    }
  }

  hide(): void {
    if (this.container.style.display === 'none') return;
    this.container.style.display = 'none';
    this.container.innerHTML = '';
    this.onClosed();
  }

  isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  destroy(): void {
    this.container.remove();
  }
}
