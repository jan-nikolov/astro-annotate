import type { ViteDevServer, Connect } from 'vite';
import type { AnnotationStorage } from '../storage/interface.js';
import { API_ANNOTATIONS } from '../constants.js';
import {
  handleListAnnotations,
  handleCreateAnnotation,
  handleUpdateAnnotation,
  handleDeleteAnnotation,
} from './api-handlers.js';

function collectBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export function registerDevMiddleware(server: ViteDevServer, storage: AnnotationStorage): void {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (!url.pathname.startsWith(API_ANNOTATIONS)) {
      return next();
    }

    try {
      let response: Response;

      // POST /api/astro-annotate/annotations
      if (url.pathname === API_ANNOTATIONS && req.method === 'POST') {
        const raw = await collectBody(req);
        const body = JSON.parse(raw);
        response = await handleCreateAnnotation(storage, body);
      }
      // GET /api/astro-annotate/annotations
      else if (url.pathname === API_ANNOTATIONS && req.method === 'GET') {
        response = await handleListAnnotations(storage, url);
      }
      // PATCH /api/astro-annotate/annotations/:id
      else if (url.pathname.startsWith(API_ANNOTATIONS + '/') && req.method === 'PATCH') {
        const id = url.pathname.slice(API_ANNOTATIONS.length + 1);
        const raw = await collectBody(req);
        const body = JSON.parse(raw);
        response = await handleUpdateAnnotation(storage, id, body);
      }
      // DELETE /api/astro-annotate/annotations/:id
      else if (url.pathname.startsWith(API_ANNOTATIONS + '/') && req.method === 'DELETE') {
        const id = url.pathname.slice(API_ANNOTATIONS.length + 1);
        response = await handleDeleteAnnotation(storage, id);
      }
      // Unknown route
      else {
        return next();
      }

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const text = await response.text();
      res.end(text);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
}
