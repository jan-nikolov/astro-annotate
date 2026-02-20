import type { Annotation } from '../types.js';
import { SHADOW_ROOT_ID, API_ANNOTATIONS } from '../constants.js';
import { OVERLAY_STYLES } from './styles.js';
import { Highlighter } from './highlighter.js';
import { AnnotationForm } from './form.js';
import { PinManager } from './pin.js';

export class Overlay {
  private host: HTMLElement;
  private shadowRoot: ShadowRoot;
  private highlighter: Highlighter;
  private form: AnnotationForm;
  private pinManager: PinManager;
  private active = false;
  private devMode = !!(window as any).__ASTRO_ANNOTATE_DEV__;
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
    this.highlighter = new Highlighter(this.shadowRoot);
    this.form = new AnnotationForm(
      this.shadowRoot,
      () => this.onAnnotationCreated(),
      () => this.onFormClosed(),
      this.devMode,
    );
    this.pinManager = new PinManager(this.shadowRoot, () => this.loadAnnotations());

    // Listen for toggle from Dev Toolbar
    window.addEventListener('aa:toggle', this.onToolbarToggle);

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

    // Keyboard shortcuts
    document.addEventListener('keydown', this.onKeyDown);
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

  private onToolbarToggle = ((e: CustomEvent) => {
    this.setActive(e.detail.active);
  }) as EventListener;

  private onElementClick = (e: MouseEvent): void => {
    const target = e.target as Element;

    // Ignore clicks on our own overlay
    if (this.host.contains(target) || this.host === target) return;

    // Don't switch targets while form is open
    if (this.form.isVisible()) return;

    e.preventDefault();
    e.stopPropagation();

    // Hide highlight and show form
    this.highlighter.hide();
    document.removeEventListener('mousemove', this.highlighter.onMouseMove);

    this.form.show(target);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    // Don't intercept when user is typing in an external input
    const active = document.activeElement;
    const isExternalInput = active &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' ||
       (active as HTMLElement).isContentEditable) &&
      active !== this.host && !this.host.contains(active);

    // Alt+C: toggle annotation mode (Figma-inspired, e.code for layout-independence)
    if (e.altKey && e.code === 'KeyC' && !isExternalInput) {
      e.preventDefault();
      const newActive = !this.active;
      this.setActive(newActive);
      window.dispatchEvent(new CustomEvent('aa:state-changed', { detail: { active: newActive } }));
      return;
    }

    // Escape: close form or exit annotation mode
    if (e.key === 'Escape') {
      if (this.form.isVisible()) {
        this.form.hide();
        return;
      }
      if (this.active) {
        this.setActive(false);
        window.dispatchEvent(new CustomEvent('aa:state-changed', { detail: { active: false } }));
        return;
      }
    }
  };

  private async loadAnnotations(): Promise<void> {
    try {
      const page = window.location.pathname;
      const res = await fetch(`${API_ANNOTATIONS}?page=${encodeURIComponent(page)}`);
      if (!res.ok) return;

      const data = await res.json();
      this.annotations = data.annotations || [];
      const openCount = this.annotations.filter((a) => a.status === 'open').length;
      window.dispatchEvent(new CustomEvent('aa:count', { detail: { count: openCount } }));
      this.renderPins();
    } catch {
      // API not available yet, will retry
    }
  }

  private renderPins(): void {
    this.pinManager.render(this.annotations);
  }

  private onAnnotationCreated(): void {
    this.loadAnnotations();
  }

  private onFormClosed(): void {
    // Re-enable highlighting if still in annotation mode
    if (this.active) {
      document.addEventListener('mousemove', this.highlighter.onMouseMove);
    }
  }

  destroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('aa:toggle', this.onToolbarToggle);
    if (this.active) {
      window.dispatchEvent(new CustomEvent('aa:state-changed', { detail: { active: false } }));
    }
    this.setActive(false);
    this.highlighter.destroy();
    this.form.destroy();
    this.pinManager.destroy();
    this.host.remove();
  }
}
