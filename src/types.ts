export interface Annotation {
  id: string;
  timestamp: string;
  page: string;
  selector: string;
  elementTag: string;
  elementText: string;
  viewport: { width: number; height: number };
  device: 'mobile' | 'tablet' | 'desktop';
  text: string;
  author: string;
  status: 'open' | 'resolved';
}

export interface AnnotationsFile {
  version: string;
  annotations: Annotation[];
}

export interface AstroAnnotateConfig {
  enabled?: boolean;
  storage?: 'local';
  annotationsPath?: string;
}

export interface ResolvedConfig {
  enabled: boolean;
  mode: 'dev' | 'deployed';
  storage: 'local';
  annotationsPath: string;
}

export interface CreateAnnotationPayload {
  page: string;
  selector: string;
  elementTag: string;
  elementText: string;
  viewport: { width: number; height: number };
  device: 'mobile' | 'tablet' | 'desktop';
  text: string;
  author: string;
}

export interface UpdateAnnotationPayload {
  status?: 'open' | 'resolved';
  text?: string;
}
