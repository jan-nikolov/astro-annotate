import type { Annotation } from '../types.js';
import { SHADOW_ROOT_ID, API_ANNOTATIONS } from '../constants.js';
import { OVERLAY_STYLES } from './styles.js';
import { Toolbar } from './toolbar.js';
import { Highlighter } from './highlighter.js';
import { AnnotationForm } from './form.js';
import { PinManager } from './pin.js';

export class Overlay {
  private host: HTMLElement;
  private shadowRoot: ShadowRoot;
  private toolbar: Toolbar;
  private highlighter: Highlighter;
  private form: AnnotationForm;
  private pinManager: PinManager;
  private active = false;
  private annotations: Annotation[] = [];

  constructor() {
    // Create host element
    this.host = document.createElement('div');
    this.host.id = SHADOW_ROOT_ID;
    document.body.appendChild(this.host);

    // Attach Shadow DOM
    this.shadowRoot = this.host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = OVERLAY_STYLES;
    this.shadowRoot.appendChild(style);

    // Create components
    this.toolbar = new Toolbar(this.shadowRoot, (active) => this.setActive(active));
    this.highlighter = new Highlighter(this.shadowRoot);
    this.form = new AnnotationForm(this.shadowRoot, () => this.onAnnotationCreated());
    this.pinManager = new PinManager(this.shadowRoot, () => this.loadAnnotations());

    // Load existing annotations
    this.loadAnnotations();

    // Close detail popup when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (!this.host.contains(target)) {
        this.pinManager.hideDetail();
      }
    });

    // Update pin positions on scroll
    let scrollTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.renderPins(), 50);
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.renderPins();
    }, { passive: true });
  }

  private setActive(active: boolean): void {
    this.active = active;

    if (active) {
      this.form.hide();
      this.pinManager.hideDetail();
      document.addEventListener('mousemove', this.highlighter.onMouseMove);
      document.addEventListener('click', this.onElementClick);
    } else {
      document.removeEventListener('mousemove', this.highlighter.onMouseMove);
      document.removeEventListener('click', this.onElementClick);
      this.highlighter.hide();
      this.form.hide();
    }
  }

  private onElementClick = (e: MouseEvent): void => {
    const target = e.target as Element;

    // Ignore clicks on our own overlay
    if (this.host.contains(target) || this.host === target) return;

    e.preventDefault();
    e.stopPropagation();

    // Hide highlight and show form
    this.highlighter.hide();
    document.removeEventListener('mousemove', this.highlighter.onMouseMove);

    this.form.show(target);
  };

  private async loadAnnotations(): Promise<void> {
    try {
      const page = window.location.pathname;
      const res = await fetch(`${API_ANNOTATIONS}?page=${encodeURIComponent(page)}`);
      if (!res.ok) return;

      const data = await res.json();
      this.annotations = data.annotations || [];
      this.toolbar.updateCount(this.annotations.filter((a) => a.status === 'open').length);
      this.renderPins();
    } catch {
      // API not available yet, will retry
    }
  }

  private renderPins(): void {
    this.pinManager.render(this.annotations);
  }

  private onAnnotationCreated(): void {
    // Deactivate annotation mode, reload annotations
    this.toolbar.deactivate();
    this.setActive(false);
    this.loadAnnotations();
  }

  destroy(): void {
    this.setActive(false);
    this.toolbar.destroy();
    this.highlighter.destroy();
    this.form.destroy();
    this.pinManager.destroy();
    this.host.remove();
  }
}
