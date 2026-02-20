import { SHADOW_ROOT_ID } from '../constants.js';
import { getElementLabel } from './selector.js';

export class Highlighter {
  private highlight: HTMLElement;
  private label: HTMLElement;
  private currentTarget: Element | null = null;

  constructor(private shadowRoot: ShadowRoot) {
    this.highlight = document.createElement('div');
    this.highlight.className = 'aa-highlight';
    this.highlight.style.display = 'none';

    this.label = document.createElement('div');
    this.label.className = 'aa-highlight-label';
    this.highlight.appendChild(this.label);

    this.shadowRoot.appendChild(this.highlight);
  }

  private isOwnElement(el: Element): boolean {
    const root = document.getElementById(SHADOW_ROOT_ID);
    return root !== null && (root === el || root.contains(el));
  }

  onMouseMove = (e: MouseEvent): void => {
    const target = e.target as Element;

    if (!target || this.isOwnElement(target)) {
      this.hide();
      return;
    }

    if (target === this.currentTarget) return;
    this.currentTarget = target;

    const rect = target.getBoundingClientRect();
    this.highlight.style.display = 'block';
    this.highlight.style.top = `${rect.top}px`;
    this.highlight.style.left = `${rect.left}px`;
    this.highlight.style.width = `${rect.width}px`;
    this.highlight.style.height = `${rect.height}px`;
    this.label.textContent = getElementLabel(target);
  };

  hide(): void {
    this.highlight.style.display = 'none';
    this.currentTarget = null;
  }

  getTarget(): Element | null {
    return this.currentTarget;
  }

  destroy(): void {
    this.highlight.remove();
  }
}
