import type { Annotation, CreateAnnotationPayload, UpdateAnnotationPayload } from '../types.js';

export interface AnnotationStorage {
  list(page?: string): Promise<Annotation[]>;
  create(payload: CreateAnnotationPayload): Promise<Annotation>;
  update(id: string, payload: UpdateAnnotationPayload): Promise<Annotation | null>;
  delete(id: string): Promise<boolean>;
}
