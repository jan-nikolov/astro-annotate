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
    border: 1px solid rgba(0, 0, 0, 0.08);
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
    border: 1px solid rgba(0, 0, 0, 0.08);
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

  /* Annotation Panel */
  .aa-panel {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 360px;
    height: calc(100vh - 32px);
    background: #fff;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #1a1a2e;
  }

  .aa-panel.aa-panel-left {
    right: auto;
    left: 16px;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }

  .aa-panel-header {
    background: #1a1a2e;
    color: #fff;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .aa-panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .aa-panel-header-actions {
    display: flex;
    gap: 4px;
  }

  .aa-panel-header-actions button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    opacity: 0.7;
  }

  .aa-panel-header-actions button:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  .aa-panel-filters {
    display: flex;
    background: #f8f8fa;
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
  }

  .aa-panel-filters button {
    flex: 1;
    padding: 10px 8px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    transition: color 0.15s, border-color 0.15s;
  }

  .aa-panel-filters button:hover {
    color: #1a1a2e;
    background: #f0f0f2;
  }

  .aa-panel-filters button.aa-active {
    color: #e94560;
    border-bottom-color: #e94560;
  }

  .aa-panel-bulk {
    padding: 10px 16px;
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
  }

  .aa-panel-bulk-btn {
    width: 100%;
    padding: 7px 12px;
    border: 1px solid #2ecc71;
    border-radius: 6px;
    background: transparent;
    color: #2ecc71;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .aa-panel-bulk-btn:hover {
    background: #2ecc71;
    color: #fff;
  }

  .aa-panel-bulk-btn[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .aa-panel-list {
    flex: 1;
    overflow-y: auto;
  }

  .aa-panel-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.1s;
  }

  .aa-panel-item:hover {
    background: #fafafa;
  }

  .aa-panel-item.aa-panel-item-resolved {
    opacity: 0.6;
  }

  .aa-panel-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .aa-panel-item-number {
    font-weight: 700;
    color: #e94560;
  }

  .aa-panel-item-number.aa-panel-item-number-resolved {
    color: #2ecc71;
  }

  .aa-panel-item-author {
    font-weight: 500;
  }

  .aa-panel-item-time {
    color: #999;
    margin-left: auto;
    font-size: 11px;
  }

  .aa-panel-item-selector {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 11px;
    color: #666;
    background: #f5f5f5;
    padding: 3px 6px;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .aa-panel-item-text {
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 8px;
    color: #333;
  }

  .aa-panel-item-actions {
    display: flex;
    gap: 6px;
  }

  .aa-panel-item-actions button {
    padding: 3px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fff;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
    color: #555;
  }

  .aa-panel-item-actions button:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }

  .aa-panel-edit-textarea {
    width: 100%;
    min-height: 60px;
    max-height: 40vh;
    padding: 8px;
    border: 1px solid #e94560;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    overflow-y: auto;
    margin-bottom: 6px;
  }

  .aa-panel-empty {
    padding: 40px 16px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }

  /* Floating Action Button */
  .aa-panel-fab {
    position: fixed;
    bottom: 72px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a2e;
    color: #fff;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 2147483647;
    transition: background 0.15s;
  }

  .aa-panel-fab:hover {
    background: #2a2a40;
  }

  .aa-panel-fab-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #e94560;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .aa-form-container, .aa-pin-detail {
      background: #2d2d3f;
      color: #e0e0e0;
      border-color: rgba(255, 255, 255, 0.1);
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

    .aa-panel {
      background: #2d2d3f;
      color: #e0e0e0;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .aa-panel.aa-panel-left {
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
    }

    .aa-panel-filters {
      background: #252538;
      border-bottom-color: #404060;
    }

    .aa-panel-filters button {
      color: #aaa;
    }

    .aa-panel-filters button:hover {
      color: #e0e0e0;
      background: #353550;
    }

    .aa-panel-bulk {
      border-bottom-color: #404060;
    }

    .aa-panel-bulk-btn {
      color: #2ecc71;
      border-color: #2ecc71;
      background: transparent;
    }

    .aa-panel-bulk-btn:hover {
      background: #2ecc71;
      color: #fff;
    }

    .aa-panel-item {
      border-bottom-color: #404060;
    }

    .aa-panel-item:hover {
      background: #353550;
    }

    .aa-panel-item-time {
      color: #888;
    }

    .aa-panel-item-selector {
      background: #1a1a2e;
      color: #aaa;
    }

    .aa-panel-item-text {
      color: #ddd;
    }

    .aa-panel-item-actions button {
      border-color: #404060;
      color: #ccc;
      background: #2d2d3f;
    }

    .aa-panel-item-actions button:hover {
      background: #404060;
    }

    .aa-panel-edit-textarea {
      background: #1a1a2e;
      color: #e0e0e0;
      border-color: #e94560;
    }

    .aa-panel-empty {
      color: #888;
    }

    .aa-panel-fab {
      background: #2d2d3f;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .aa-panel-fab:hover {
      background: #404060;
    }
  }
`;
