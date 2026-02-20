import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { Annotation, AnnotationsFile, CreateAnnotationPayload, UpdateAnnotationPayload } from '../types.js';
import type { AnnotationStorage } from './interface.js';
import { ANNOTATIONS_VERSION } from '../constants.js';

function generateId(): string {
  return 'a_' + randomBytes(4).toString('hex');
}

function detectDevice(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export class LocalStorage implements AnnotationStorage {
  private filePath: string;

  constructor(annotationsPath: string, projectRoot: string) {
    this.filePath = resolve(projectRoot, annotationsPath);
  }

  private read(): AnnotationsFile {
    if (!existsSync(this.filePath)) {
      return { version: ANNOTATIONS_VERSION, annotations: [] };
    }
    const raw = readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw) as AnnotationsFile;
  }

  private write(data: AnnotationsFile): void {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  async list(page?: string): Promise<Annotation[]> {
    const data = this.read();
    if (page) {
      return data.annotations.filter((a) => a.page === page);
    }
    return data.annotations;
  }

  async create(payload: CreateAnnotationPayload): Promise<Annotation> {
    const data = this.read();
    const annotation: Annotation = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      page: payload.page,
      selector: payload.selector,
      elementTag: payload.elementTag,
      elementText: payload.elementText.slice(0, 200),
      viewport: payload.viewport,
      device: payload.device || detectDevice(payload.viewport.width),
      text: payload.text,
      author: payload.author || 'Anonymous',
      status: 'open',
    };
    data.annotations.push(annotation);
    this.write(data);
    return annotation;
  }

  async update(id: string, payload: UpdateAnnotationPayload): Promise<Annotation | null> {
    const data = this.read();
    const index = data.annotations.findIndex((a) => a.id === id);
    if (index === -1) return null;

    if (payload.status) data.annotations[index].status = payload.status;
    if (payload.text !== undefined) data.annotations[index].text = payload.text;

    this.write(data);
    return data.annotations[index];
  }

  async delete(id: string): Promise<boolean> {
    const data = this.read();
    const before = data.annotations.length;
    data.annotations = data.annotations.filter((a) => a.id !== id);
    if (data.annotations.length === before) return false;
    this.write(data);
    return true;
  }
}
