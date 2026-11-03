const apiKey = process.env.GEMINI_API_KEY;

const modelsToTest = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

async function checkModels() {
  for (const m of modelsToTest) {
    try {
      const start = Date.now();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with just "OK"' }] }]
        })
      });
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`[AVAILABLE] ${m} responded in ${Date.now() - start}ms:`, data.candidates[0].content.parts[0].text.trim());
      } else {
        console.log(`[UNAVAILABLE] ${m} (${res.status}):`, data.error?.message || data.error);
      }
    } catch (e) {
      console.log(`[ERROR] ${m}:`, e.message);
    }
  }
}

checkModels();

