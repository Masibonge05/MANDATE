import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateGeminiJsonContent } from '../lib/gemini-client.ts';

const successfulResponse = {
  candidates: [{
    content: {
      parts: [{ text: '{"result":"ok"}' }],
    },
  }],
};

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

describe('Gemini REST client', () => {
  it('uses the documented default model and sends the key in a header', async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.GEMINI_API_KEY;
    const originalModel = process.env.GEMINI_MODEL;
    let requestedUrl = '';
    let requestedKey = '';

    process.env.GEMINI_API_KEY = 'test-only-key';
    delete process.env.GEMINI_MODEL;
    globalThis.fetch = async (input, init) => {
      requestedUrl = String(input);
      requestedKey = new Headers(init?.headers).get('x-goog-api-key') ?? '';
      return new Response(JSON.stringify(successfulResponse), { status: 200 });
    };

    try {
      const result = await generateGeminiJsonContent('test prompt');
      assert.equal(result?.model, 'gemini-4-hydrogen');
      assert.equal(result?.text, '{"result":"ok"}');
      assert.match(requestedUrl, /models\/gemini-4-hydrogen:generateContent$/);
      assert.equal(new URL(requestedUrl).searchParams.has('key'), false);
      assert.equal(requestedKey, 'test-only-key');
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment('GEMINI_API_KEY', originalApiKey);
      restoreEnvironment('GEMINI_MODEL', originalModel);
    }
  });

  it('tries a documented fallback model when the configured model is not found', async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.GEMINI_API_KEY;
    const originalModel = process.env.GEMINI_MODEL;
    const requestedModels: string[] = [];

    process.env.GEMINI_API_KEY = 'test-only-key';
    process.env.GEMINI_MODEL = 'missing-test-model';
    globalThis.fetch = async input => {
      const model = new URL(String(input)).pathname.split('/').pop()?.split(':')[0] ?? '';
      requestedModels.push(model);
      if (model === 'missing-test-model') {
        return new Response('not found', { status: 404 });
      }
      return new Response(JSON.stringify(successfulResponse), { status: 200 });
    };

    try {
      const result = await generateGeminiJsonContent('test prompt');
      assert.equal(result?.model, 'gemini-4-hydrogen');
      assert.deepEqual(requestedModels, ['missing-test-model', 'gemini-4-hydrogen']);
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment('GEMINI_API_KEY', originalApiKey);
      restoreEnvironment('GEMINI_MODEL', originalModel);
    }
  });

  it('does not retry models when Gemini rejects API credentials', async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.GEMINI_API_KEY;
    const originalModel = process.env.GEMINI_MODEL;
    let requestCount = 0;

    process.env.GEMINI_API_KEY = 'test-only-key';
    delete process.env.GEMINI_MODEL;
    globalThis.fetch = async () => {
      requestCount++;
      return new Response('unauthorized', { status: 401 });
    };

    try {
      await assert.rejects(
        generateGeminiJsonContent('test prompt'),
        /Gemini rejected API credentials or access \(HTTP 401\)/,
      );
      assert.equal(requestCount, 1);
    } finally {
      globalThis.fetch = originalFetch;
      restoreEnvironment('GEMINI_API_KEY', originalApiKey);
      restoreEnvironment('GEMINI_MODEL', originalModel);
    }
  });
});
