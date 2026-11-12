const GEMINI_REQUEST_TIMEOUT_MS = 45_000;
const FALLBACK_MODELS = ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export interface GeminiJsonResponse {
  model: string;
  text: string;
}

export async function generateGeminiJsonContent(prompt: string): Promise<GeminiJsonResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const preferredModel = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
  const models = [preferredModel, ...FALLBACK_MODELS.filter(model => model !== preferredModel)];
  let lastModelError: Error | undefined;

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
          signal: controller.signal,
        },
      );

      if (response.status === 404) {
        lastModelError = new Error(`Gemini model "${model}" was not found.`);
        continue;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini rejected API credentials or access (HTTP ${response.status}). Verify GEMINI_API_KEY and Gemini API access.`);
        }
        throw new Error(`Gemini API returned HTTP ${response.status} for model "${model}".`);
      }

      const data = await response.json() as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.find(part => typeof part.text === 'string')?.text;
      if (!text) {
        throw new Error(`Gemini returned no candidate text for model "${model}".`);
      }

      return { model, text };
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(`Gemini request timed out after ${GEMINI_REQUEST_TIMEOUT_MS}ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastModelError ?? new Error('No supported Gemini model was available.');
}
