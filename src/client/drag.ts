interface DragResizeOptions {
  minWidth: number;
  minHeight: number;
  visibleMargin: number;
}

interface DragResizeCallbacks {
  onDragStart?: () => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  onResizeStart?: () => void;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

export class DragResize {
  private target: HTMLElement;
  private dragHandle: HTMLElement;
  private resizeHandle: HTMLElement;
  private opts: DragResizeOptions;
  private callbacks: DragResizeCallbacks;

  private dragging = false;
  private resizing = false;
  private hasMoved = false;
  private startX = 0;
  private startY = 0;
  private startLeft = 0;
  private startTop = 0;
  private startWidth = 0;
  private startHeight = 0;
  private savedUserSelect = '';

  private onDragMouseDown: (e: MouseEvent) => void;
  private onResizeMouseDown: (e: MouseEvent) => void;
  private onMouseMove: (e: MouseEvent) => void;
  private onMouseUp: (e: MouseEvent) => void;

  constructor(
    target: HTMLElement,
    dragHandle: HTMLElement,
    resizeHandle: HTMLElement,
    options: DragResizeOptions,
    callbacks: DragResizeCallbacks,
  ) {
    this.target = target;
    this.dragHandle = dragHandle;
    this.resizeHandle = resizeHandle;
    this.opts = options;
    this.callbacks = callbacks;

    this.onDragMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.dragging = true;
      this.hasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      const rect = this.target.getBoundingClientRect();
      this.startLeft = rect.left;
      this.startTop = rect.top;
      this.lockUserSelect();
      this.callbacks.onDragStart?.();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    };

    this.onResizeMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      this.resizing = true;
      this.hasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      const rect = this.target.getBoundingClientRect();
      this.startWidth = rect.width;
      this.startHeight = rect.height;
      this.lockUserSelect();
      this.callbacks.onResizeStart?.();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    };

    this.onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      if (!this.hasMoved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      this.hasMoved = true;

      if (this.dragging) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = this.target.getBoundingClientRect();
        let x = this.startLeft + dx;
        let y = this.startTop + dy;
        // Clamp: at least visibleMargin px inside viewport
        x = Math.max(this.opts.visibleMargin - rect.width, Math.min(x, vw - this.opts.visibleMargin));
        y = Math.max(0, Math.min(y, vh - this.opts.visibleMargin));
        this.callbacks.onDrag?.(x, y);
      }

      if (this.resizing) {
        const w = Math.max(this.opts.minWidth, this.startWidth + dx);
        const h = Math.max(this.opts.minHeight, this.startHeight + dy);
        this.callbacks.onResize?.(w, h);
      }
    };

    this.onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      this.restoreUserSelect();

      if (this.dragging) {
        this.dragging = false;
        if (this.hasMoved) {
          const rect = this.target.getBoundingClientRect();
          this.callbacks.onDragEnd?.(rect.left, rect.top);
          // Suppress click after drag
          const suppress = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
          this.dragHandle.addEventListener('click', suppress, { capture: true, once: true });
        }
      }

      if (this.resizing) {
        this.resizing = false;
        if (this.hasMoved) {
          const rect = this.target.getBoundingClientRect();
          this.callbacks.onResizeEnd?.(rect.width, rect.height);
        }
      }
    };
  }

  enable(): void {
    this.dragHandle.addEventListener('mousedown', this.onDragMouseDown);
    this.resizeHandle.addEventListener('mousedown', this.onResizeMouseDown);
  }

  disable(): void {
    this.dragHandle.removeEventListener('mousedown', this.onDragMouseDown);
    this.resizeHandle.removeEventListener('mousedown', this.onResizeMouseDown);
  }

  destroy(): void {
    this.disable();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.restoreUserSelect();
  }

  private lockUserSelect(): void {
    this.savedUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
  }

  private restoreUserSelect(): void {
    document.body.style.userSelect = this.savedUserSelect;
  }
}
