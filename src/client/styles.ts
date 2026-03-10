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

  /* Inline Comment Input */
  @keyframes aa-pop-in {
    from { opacity: 0; transform: scale(0.95) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes aa-pop-in-above {
    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .aa-inline-input {
    position: fixed;
    z-index: 2147483647;
    width: 320px;
    max-width: calc(100vw - 32px);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: aa-pop-in 0.15s ease-out;
  }

  .aa-inline-input.aa-inline-above {
    animation-name: aa-pop-in-above;
  }

  .aa-inline-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transform: rotate(45deg);
  }

  .aa-inline-arrow-top {
    top: -7px;
    border-bottom: none;
    border-right: none;
  }

  .aa-inline-arrow-bottom {
    bottom: -7px;
    border-top: none;
    border-left: none;
  }

  .aa-inline-tag {
    display: inline-block;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 11px;
    font-weight: 500;
    background: #f0f0f2;
    color: #666;
    padding: 3px 8px;
    border-radius: 10px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .aa-inline-author {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .aa-inline-author:focus {
    border-color: #e94560;
  }

  .aa-inline-textarea {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    resize: none;
    min-height: 36px;
    max-height: 200px;
    line-height: 1.5;
    transition: border-color 0.15s;
  }

  .aa-inline-textarea:focus {
    border-color: #e94560;
  }

  .aa-inline-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .aa-inline-hint {
    font-size: 11px;
    color: #999;
  }

  .aa-inline-submit {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e94560;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .aa-inline-submit:hover {
    background: #c73e54;
  }

  .aa-inline-submit:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .aa-inline-submit svg {
    width: 16px;
    height: 16px;
  }

  /* Keep these for pin-detail header reuse */
  .aa-form-header-title {
    font-size: 13px;
    font-weight: 600;
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

  /* Pin Wrapper */
  .aa-pin-wrapper {
    position: fixed;
    width: 20px;
    height: 20px;
    z-index: 2147483645;
    cursor: pointer;
  }

  .aa-pin-wrapper .aa-pin {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* Pins */
  .aa-pin {
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    background: #e94560;
    box-shadow: 0 2px 6px rgba(233, 69, 96, 0.4);
    transition: scale 0.15s, box-shadow 0.15s;
  }

  .aa-pin-wrapper:hover .aa-pin {
    scale: 1.15;
    box-shadow: 0 3px 10px rgba(233, 69, 96, 0.55);
  }

  .aa-pin.aa-resolved {
    background: #2ecc71;
    box-shadow: 0 2px 6px rgba(46, 204, 113, 0.4);
  }

  .aa-pin-wrapper:hover .aa-pin.aa-resolved {
    box-shadow: 0 3px 10px rgba(46, 204, 113, 0.55);
  }

  /* Pin Count Badge */
  .aa-pin-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #1a1a2e;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    line-height: 1;
    z-index: 1;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
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
    max-width: calc(100vw - 32px);
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

  /* Thread Styles */
  .aa-thread-list {
    max-height: 60vh;
    overflow-y: auto;
  }

  .aa-thread-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .aa-thread-item:last-child {
    border-bottom: none;
  }

  .aa-thread-item.aa-thread-resolved {
    opacity: 0.6;
  }

  .aa-thread-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .aa-thread-number {
    font-weight: 700;
    color: #e94560;
  }

  .aa-thread-resolved .aa-thread-number {
    color: #2ecc71;
  }

  .aa-thread-author {
    font-weight: 500;
  }

  .aa-thread-time {
    color: #999;
    margin-left: auto;
    font-size: 11px;
  }

  .aa-thread-item-text {
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 8px;
  }

  .aa-thread-item-actions {
    display: flex;
    gap: 6px;
  }

  /* Annotation Panel */
  .aa-panel {
    position: fixed;
    top: 16px;
    right: auto;
    left: calc(100vw - 360px - 16px);
    width: 360px;
    max-width: calc(100vw - 32px);
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
    transition: left 0.25s ease;
  }

  .aa-panel.aa-panel-left {
    left: 16px;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 400px) {
    .aa-panel {
      width: calc(100vw - 16px);
      left: 8px;
      border-radius: 8px;
    }

    .aa-panel.aa-panel-left {
      left: 8px;
    }
  }

  /* Floating panel mode */
  .aa-panel-floating {
    transition: none;
    height: auto;
  }

  .aa-panel-no-transition {
    transition: none !important;
  }

  .aa-panel-snapping {
    transition: left 0.25s ease, top 0.25s ease, width 0.25s ease, height 0.25s ease;
  }

  /* Resize handle */
  .aa-panel-resize {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    z-index: 1;
  }

  .aa-panel-resize::after {
    content: '';
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(0, 0, 0, 0.2);
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  }

  /* Snap zone indicator */
  .aa-snap-zone {
    position: fixed;
    top: 0;
    width: 60px;
    height: 100vh;
    border: 2px dashed rgba(233, 69, 96, 0.3);
    background: rgba(233, 69, 96, 0.05);
    z-index: 2147483646;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
  }

  .aa-snap-zone-left {
    left: 0;
  }

  .aa-snap-zone-right {
    right: 0;
  }

  .aa-snap-zone.aa-snap-active {
    opacity: 1;
  }

  .aa-panel-header {
    background: #1a1a2e;
    color: #fff;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    cursor: grab;
  }

  .aa-panel-header:active {
    cursor: grabbing;
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

  .aa-panel-fab.aa-fab-active {
    background: #e94560;
    animation: aa-fab-pulse 2s infinite;
  }

  .aa-panel-fab.aa-fab-panel-open {
    background: #e94560;
    animation: aa-fab-pulse 2s infinite;
  }

  @keyframes aa-fab-pulse {
    0%, 100% { box-shadow: 0 2px 8px rgba(233, 69, 96, 0.4); }
    50% { box-shadow: 0 2px 16px rgba(233, 69, 96, 0.7); }
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

  /* Annotate FAB (upper button) */
  .aa-annotate-fab {
    position: fixed;
    bottom: 112px;
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

  .aa-annotate-fab:hover {
    background: #e94560;
  }

  .aa-annotate-fab.aa-fab-active {
    background: #e94560;
    animation: aa-fab-pulse 2s infinite;
  }

  /* FAB Shortcut Labels */
  .aa-fab-label {
    position: fixed;
    right: 54px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 10px;
    color: #999;
    background: rgba(0, 0, 0, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
  }

  .aa-fab-label-upper {
    bottom: 116px;
  }

  .aa-fab-label-lower {
    bottom: 76px;
  }

  .aa-panel-fab.aa-fab-left { right: auto; left: 16px; }
  .aa-annotate-fab.aa-fab-left { right: auto; left: 16px; }
  .aa-fab-label.aa-fab-label-left { right: auto; left: 54px; }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .aa-inline-input {
      background: #2d2d3f;
      color: #e0e0e0;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .aa-inline-arrow {
      background: #2d2d3f;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .aa-inline-tag {
      background: #1a1a2e;
      color: #aaa;
    }

    .aa-inline-author, .aa-inline-textarea {
      background: #1a1a2e;
      border-color: #404060;
      color: #e0e0e0;
    }

    .aa-inline-author:focus, .aa-inline-textarea:focus {
      border-color: #e94560;
    }

    .aa-inline-hint {
      color: #777;
    }

    .aa-pin-detail {
      background: #2d2d3f;
      color: #e0e0e0;
      border-color: rgba(255, 255, 255, 0.1);
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

    .aa-panel-fab.aa-fab-active {
      background: #e94560;
    }

    .aa-panel-fab.aa-fab-panel-open {
      background: #e94560;
    }

    .aa-pin-badge {
      background: #e0e0e0;
      color: #1a1a2e;
    }

    .aa-thread-item {
      border-bottom-color: #404060;
    }

    .aa-thread-item-text {
      color: #ddd;
    }

    .aa-thread-time {
      color: #888;
    }

    .aa-annotate-fab {
      background: #2d2d3f;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .aa-annotate-fab:hover {
      background: #e94560;
    }

    .aa-fab-label {
      color: #777;
      background: rgba(255, 255, 255, 0.08);
    }

    .aa-panel-resize::after {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .aa-snap-zone {
      border-color: rgba(233, 69, 96, 0.4);
      background: rgba(233, 69, 96, 0.08);
    }
  }
`;
