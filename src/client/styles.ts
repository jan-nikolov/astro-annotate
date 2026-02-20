export const OVERLAY_STYLES = `
  :host {
    all: initial;
    position: fixed;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1a1a2e;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Toolbar */
  .aa-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1a1a2e;
    color: #fff;
    padding: 8px 16px;
    border-radius: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }

  .aa-toolbar:hover {
    background: #16213e;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.35);
  }

  .aa-toolbar.aa-active {
    background: #e94560;
  }

  .aa-toolbar.aa-active:hover {
    background: #c73e54;
  }

  .aa-toolbar-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .aa-toolbar-label {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }

  .aa-badge {
    background: #e94560;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }

  .aa-toolbar.aa-active .aa-badge {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Element Highlight */
  .aa-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px solid #e94560;
    background: rgba(233, 69, 96, 0.08);
    border-radius: 3px;
    z-index: 2147483646;
    transition: all 0.1s ease;
  }

  .aa-highlight-label {
    position: absolute;
    top: -26px;
    left: -2px;
    background: #e94560;
    color: #fff;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 3px 3px 0 0;
    white-space: nowrap;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Annotation Form */
  .aa-form-container {
    position: fixed;
    z-index: 2147483647;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 340px;
    overflow: hidden;
  }

  .aa-form-header {
    background: #1a1a2e;
    color: #fff;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .aa-form-header-title {
    font-size: 13px;
    font-weight: 600;
  }

  .aa-form-header-selector {
    font-size: 11px;
    opacity: 0.7;
    font-family: 'SF Mono', Monaco, monospace;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .aa-form-close {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    opacity: 0.7;
    padding: 0 0 0 8px;
  }

  .aa-form-close:hover {
    opacity: 1;
  }

  .aa-form-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .aa-input, .aa-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .aa-input:focus, .aa-textarea:focus {
    border-color: #e94560;
  }

  .aa-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .aa-form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .aa-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }

  .aa-btn-primary {
    background: #e94560;
    color: #fff;
  }

  .aa-btn-primary:hover {
    background: #c73e54;
  }

  .aa-btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .aa-btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .aa-btn-secondary:hover {
    background: #e0e0e0;
  }

  /* Pins */
  .aa-pin {
    position: absolute;
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    background: #e94560;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(233, 69, 96, 0.4);
    transition: transform 0.15s, box-shadow 0.15s;
    z-index: 2147483645;
  }

  .aa-pin:hover {
    transform: rotate(-45deg) scale(1.15);
    box-shadow: 0 4px 12px rgba(233, 69, 96, 0.5);
  }

  .aa-pin.aa-resolved {
    background: #2ecc71;
    box-shadow: 0 2px 8px rgba(46, 204, 113, 0.4);
  }

  .aa-pin-number {
    transform: rotate(45deg);
  }

  /* Pin Detail Popup */
  .aa-pin-detail {
    position: fixed;
    z-index: 2147483647;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 320px;
    overflow: hidden;
  }

  .aa-pin-detail-header {
    background: #1a1a2e;
    color: #fff;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .aa-pin-detail-meta {
    font-size: 11px;
    opacity: 0.7;
  }

  .aa-pin-detail-body {
    padding: 16px;
  }

  .aa-pin-detail-text {
    font-size: 14px;
    margin-bottom: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .aa-pin-detail-info {
    font-size: 12px;
    color: #888;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .aa-pin-detail-selector {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 11px;
    color: #666;
    background: #f5f5f5;
    padding: 4px 8px;
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .aa-pin-detail-actions {
    padding: 0 16px 16px;
    display: flex;
    gap: 8px;
  }

  .aa-status-btn {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    background: #fff;
    transition: all 0.15s;
  }

  .aa-status-btn:hover {
    background: #f5f5f5;
  }

  .aa-status-btn.aa-resolve {
    color: #2ecc71;
    border-color: #2ecc71;
  }

  .aa-status-btn.aa-resolve:hover {
    background: #2ecc71;
    color: #fff;
  }

  .aa-status-btn.aa-reopen {
    color: #e94560;
    border-color: #e94560;
  }

  .aa-status-btn.aa-reopen:hover {
    background: #e94560;
    color: #fff;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .aa-form-container, .aa-pin-detail {
      background: #2d2d3f;
      color: #e0e0e0;
    }

    .aa-input, .aa-textarea {
      background: #1a1a2e;
      border-color: #404060;
      color: #e0e0e0;
    }

    .aa-btn-secondary {
      background: #404060;
      color: #e0e0e0;
    }

    .aa-btn-secondary:hover {
      background: #505070;
    }

    .aa-pin-detail-selector {
      background: #1a1a2e;
      color: #aaa;
    }

    .aa-status-btn {
      background: #2d2d3f;
      border-color: #404060;
    }

    .aa-status-btn:hover {
      background: #404060;
    }
  }
`;
