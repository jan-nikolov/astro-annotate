import type { AnnotationStorage } from '../storage/interface.js';
import type { CreateAnnotationPayload, UpdateAnnotationPayload } from '../types.js';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleListAnnotations(
  storage: AnnotationStorage,
  url: URL,
): Promise<Response> {
  const page = url.searchParams.get('page') || undefined;
  const annotations = await storage.list(page);
  return json({ annotations });
}

export async function handleCreateAnnotation(
  storage: AnnotationStorage,
  body: unknown,
): Promise<Response> {
  const payload = body as CreateAnnotationPayload;

  if (!payload.selector || !payload.text || !payload.page) {
    return json({ error: 'Missing required fields: selector, text, page' }, 400);
  }

  const annotation = await storage.create(payload);
  return json({ annotation }, 201);
}

export async function handleUpdateAnnotation(
  storage: AnnotationStorage,
  id: string,
  body: unknown,
): Promise<Response> {
  const payload = body as UpdateAnnotationPayload;
  const annotation = await storage.update(id, payload);

  if (!annotation) {
    return json({ error: 'Annotation not found' }, 404);
  }

  return json({ annotation });
}

export async function handleDeleteAnnotation(
  storage: AnnotationStorage,
  id: string,
): Promise<Response> {
  const deleted = await storage.delete(id);

  if (!deleted) {
    return json({ error: 'Annotation not found' }, 404);
  }

  return json({ success: true });
}
