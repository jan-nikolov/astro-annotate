const ASTRO_CLASS_RE = /^astro-[a-zA-Z0-9]+$/;
const IGNORED_TAGS = new Set(['html', 'body', 'head']);

function isAstroClass(cls: string): boolean {
  return ASTRO_CLASS_RE.test(cls);
}

function getStableClasses(el: Element): string[] {
  return Array.from(el.classList).filter((cls) => !isAstroClass(cls));
}

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function escapeSelector(value: string): string {
  return CSS.escape(value);
}

export function generateSelector(target: Element): string {
  if (IGNORED_TAGS.has(target.tagName.toLowerCase())) {
    return target.tagName.toLowerCase();
  }

  // 1. ID (if stable — not auto-generated)
  if (target.id && !/^[0-9]/.test(target.id) && !target.id.includes(':')) {
    const sel = `#${escapeSelector(target.id)}`;
    if (isUnique(sel)) return sel;
  }

  // 2. data-testid
  const testId = target.getAttribute('data-testid');
  if (testId) {
    const sel = `[data-testid="${escapeSelector(testId)}"]`;
    if (isUnique(sel)) return sel;
  }

  // 3. Tag + stable classes
  const tag = target.tagName.toLowerCase();
  const classes = getStableClasses(target);
  if (classes.length > 0) {
    const classSel = classes.map((c) => `.${escapeSelector(c)}`).join('');
    const sel = `${tag}${classSel}`;
    if (isUnique(sel)) return sel;
  }

  // 4. Build path upward with nth-child
  const path: string[] = [];
  let current: Element | null = target;

  while (current && !IGNORED_TAGS.has(current.tagName.toLowerCase())) {
    let segment = current.tagName.toLowerCase();

    // Try id first
    if (current.id && !/^[0-9]/.test(current.id) && !current.id.includes(':')) {
      segment = `#${escapeSelector(current.id)}`;
      path.unshift(segment);
      const sel = path.join(' > ');
      if (isUnique(sel)) return sel;
      // ID should be unique, break here
      break;
    }

    // Try tag + classes
    const cls = getStableClasses(current);
    if (cls.length > 0) {
      segment += cls.map((c) => `.${escapeSelector(c)}`).join('');
    }

    // Add nth-child if not unique enough
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (s) => s.tagName === current!.tagName,
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        segment += `:nth-child(${index})`;
      }
    }

    path.unshift(segment);
    const sel = path.join(' > ');
    if (isUnique(sel)) return sel;

    current = parent;
  }

  return path.join(' > ') || tag;
}

export function getElementLabel(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = getStableClasses(el);
  const classStr = classes.length > 0 ? `.${classes.slice(0, 3).join('.')}` : '';
  return `<${tag}${classStr}>`;
}

export function getElementText(el: Element): string {
  const text = el.textContent?.trim() || '';
  return text.slice(0, 200);
}
