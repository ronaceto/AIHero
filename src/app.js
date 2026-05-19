import { createServer } from 'node:http';
import { getConfig } from './config.js';
import { createMemoryStore } from './data/memoryStore.js';
import { createAuthService } from './services/authService.js';
import { readJson, sendError, sendJson } from './http/responses.js';

function routeKey(method, pathname) {
  return `${method.toUpperCase()} ${pathname}`;
}

function mapError(res, error) {
  if (error instanceof SyntaxError) {
    sendError(res, 400, 'INVALID_JSON', 'Request body must be valid JSON.');
    return;
  }

  if (error.code === 'VALIDATION_ERROR') {
    sendError(res, 400, 'VALIDATION_ERROR', error.message, error.details);
    return;
  }

  if (error.code === 'DUPLICATE_EMAIL') {
    sendError(res, 409, 'DUPLICATE_EMAIL', error.message);
    return;
  }

  if (error.code === 'INVALID_CREDENTIALS' || error.code === 'INVALID_REFRESH_TOKEN') {
    sendError(res, 401, error.code, error.message);
    return;
  }

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred.');
}

export function createApp(options = {}) {
  const config = options.config || getConfig();
  const store = options.store || createMemoryStore();
  const authService = options.authService || createAuthService({ store, jwtSecret: config.jwtSecret });

  const routes = new Map();

  routes.set(routeKey('GET', '/health'), async (_req, res) => {
    sendJson(res, 200, {
      status: 'ok',
      service: 'studysidekickai-api',
      timestamp: new Date().toISOString(),
    });
  });

  routes.set(routeKey('GET', '/api/v1/health'), routes.get(routeKey('GET', '/health')));

  routes.set(routeKey('POST', '/api/v1/auth/signup'), async (req, res) => {
    const payload = await readJson(req);
    const result = await authService.signup(payload);
    sendJson(res, 201, result);
  });

  routes.set(routeKey('POST', '/api/v1/auth/login'), async (req, res) => {
    const payload = await readJson(req);
    const result = await authService.login(payload);
    sendJson(res, 200, result);
  });

  routes.set(routeKey('POST', '/api/v1/auth/refresh'), async (req, res) => {
    const payload = await readJson(req);
    const result = await authService.refresh(payload.refreshToken || '');
    sendJson(res, 200, result);
  });

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const handler = routes.get(routeKey(req.method, url.pathname));

    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'DENY');
    res.setHeader('referrer-policy', 'no-referrer');

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': 'content-type,authorization',
      });
      res.end();
      return;
    }

    res.setHeader('access-control-allow-origin', '*');

    if (!handler) {
      sendError(res, 404, 'NOT_FOUND', 'Route not found.');
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      mapError(res, error);
    }
  });
}
