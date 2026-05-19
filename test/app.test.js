import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/data/memoryStore.js';

async function startTestServer() {
  const server = createApp({
    config: { jwtSecret: 'test-secret' },
    store: createMemoryStore(),
  });

  server.listen(0);
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return { server, baseUrl };
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { response, body };
}

test('health endpoint returns service status', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const { response, body } = await request(baseUrl, '/api/v1/health');

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'studysidekickai-api');
  } finally {
    server.close();
  }
});

test('signup creates a student account and returns tokens', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const { response, body } = await request(baseUrl, '/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ava@example.edu',
        password: 'correct-horse-battery-staple',
        role: 'student',
        displayName: 'Ava',
        gradeLevel: 8,
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(body.user.role, 'student');
    assert.equal(body.user.displayName, 'Ava');
    assert.equal(body.user.gradeLevel, 8);
    assert.match(body.tokens.accessToken, /^.+\..+\..+$/);
    assert.match(body.tokens.refreshToken, /^.+\..+\..+$/);
  } finally {
    server.close();
  }
});

test('login rejects invalid credentials and accepts valid credentials', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    await request(baseUrl, '/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'teacher@example.edu',
        password: 'correct-horse-battery-staple',
        role: 'teacher',
        displayName: 'Mr. Lee',
      }),
    });

    const badLogin = await request(baseUrl, '/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@example.edu', password: 'wrong-password' }),
    });

    assert.equal(badLogin.response.status, 401);
    assert.equal(badLogin.body.error.code, 'INVALID_CREDENTIALS');

    const goodLogin = await request(baseUrl, '/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@example.edu', password: 'correct-horse-battery-staple' }),
    });

    assert.equal(goodLogin.response.status, 200);
    assert.equal(goodLogin.body.user.role, 'teacher');
    assert.match(goodLogin.body.tokens.accessToken, /^.+\..+\..+$/);
  } finally {
    server.close();
  }
});


test('refresh returns a new token pair for a valid refresh token', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const signup = await request(baseUrl, '/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'refresh@example.edu',
        password: 'correct-horse-battery-staple',
        role: 'student',
        displayName: 'Refresh Student',
        gradeLevel: 7,
      }),
    });

    const refreshed = await request(baseUrl, '/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: signup.body.tokens.refreshToken }),
    });

    assert.equal(refreshed.response.status, 200);
    assert.equal(refreshed.body.user.displayName, 'Refresh Student');
    assert.match(refreshed.body.tokens.accessToken, /^.+\..+\..+$/);
    assert.match(refreshed.body.tokens.refreshToken, /^.+\..+\..+$/);
  } finally {
    server.close();
  }
});
