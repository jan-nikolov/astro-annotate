import type { CreateAnnotationPayload } from '../types.js';
import { API_ANNOTATIONS } from '../constants.js';
import { generateSelector, getElementText } from './selector.js';

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
    this.container.className = 'aa-form-container';
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

    // Position: below and to the right of the element, or above if not enough space
    let top = rect.bottom + 8;
    let left = rect.left;

    if (top + 300 > window.innerHeight) {
      top = rect.top - 308;
    }
    if (left + 340 > window.innerWidth) {
      left = window.innerWidth - 350;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
    this.container.style.display = 'block';

    this.container.innerHTML = `
      <div class="aa-form-header">
        <div>
          <div class="aa-form-header-title">New Annotation</div>
          <div class="aa-form-header-selector">${this.escapeHtml(selector)}</div>
        </div>
        <button class="aa-form-close" data-action="close">&times;</button>
      </div>
      <div class="aa-form-body">
        ${this.devMode ? '' : '<input class="aa-input" type="text" placeholder="Your name" data-field="author" value="" />'}
        <textarea class="aa-textarea" placeholder="What should be changed?" data-field="text"></textarea>
        <div class="aa-form-actions">
          <button class="aa-btn aa-btn-secondary" data-action="close">Cancel</button>
          <button class="aa-btn aa-btn-primary" data-action="submit">Submit</button>
        </div>
      </div>
    `;

    // Focus textarea
    const textarea = this.container.querySelector('[data-field="text"]') as HTMLTextAreaElement;
    setTimeout(() => textarea?.focus(), 50);

    // Event listeners
    this.container.querySelectorAll('[data-action="close"]').forEach((btn) => {
      btn.addEventListener('click', () => this.hide());
    });

    const submitBtn = this.container.querySelector('[data-action="submit"]') as HTMLButtonElement;
    submitBtn.addEventListener('click', () => {
      this.submit(selector, elementTag, elementText);
    });

    // Submit on Ctrl+Enter
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        this.submit(selector, elementTag, elementText);
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
    submitBtn.textContent = 'Saving...';

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
      submitBtn.textContent = 'Submit';
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

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  destroy(): void {
    this.container.remove();
  }
}
