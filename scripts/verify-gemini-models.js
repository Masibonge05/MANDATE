import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
}

const apiKey = env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY missing in .env.local');
  process.exit(1);
}

const models = ['gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

console.log('========================================================================');
console.log('   MANDATE — GEMINI MODEL VERIFICATION TEST');
console.log('   Testing live API key against each configured model');
console.log('========================================================================\n');

const testPayload = {
  contents: [{
    parts: [{
      text: `You are MANDATE's AI Transaction Security Reviewer. Inspect this transaction:
Product: "Pro Photo UV Lens Filter 67mm"
Merchant: "Apex Optics"
Price: 45.00 USD
Mandate: "Sister Photography Gift Mandate" - Limit: $100
Return STRICT JSON: {"risk_level": "LOW"|"MEDIUM"|"HIGH", "intent_match": true|false, "prompt_injection_detected": true|false, "recommendation": "APPROVE"|"FLAG"|"BLOCK"}`
    }]
  }],
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.1,
  }
};

async function testModel(modelName) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const start = Date.now();
  console.log(`[TESTING] Model: ${modelName}...`);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    const elapsed = Date.now() - start;
    const status = res.status;
    const data = await res.json();

    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = text;
      }
      console.log(`  -> STATUS: ${status} OK (${elapsed}ms)`);
      console.log(`  -> STRUCTURED JSON OUTPUT:`, JSON.stringify(parsed));
      return { model: modelName, ok: true, status, elapsed, parsed };
    } else {
      console.log(`  -> STATUS: ${status} FAIL (${elapsed}ms)`);
      console.log(`  -> ERROR:`, data.error?.message || JSON.stringify(data));
      return { model: modelName, ok: false, status, elapsed, error: data.error?.message };
    }
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`  -> NETWORK ERROR (${elapsed}ms):`, err.message);
    return { model: modelName, ok: false, status: 'NETWORK_ERROR', elapsed, error: err.message };
  }
}

async function run() {
  const results = [];
  for (const m of models) {
    const r = await testModel(m);
    results.push(r);
    console.log('');
  }

  console.log('========================================================================');
  console.log('   VERIFICATION SUMMARY');
  console.log('========================================================================');
  for (const r of results) {
    console.log(`Model ${r.model.padEnd(25)}: ${r.ok ? 'PASS (Ready)' : 'UNAVAILABLE (' + r.status + ': ' + (r.error || '') + ')'} - ${r.elapsed}ms`);
  }

  const working = results.filter(r => r.ok).map(r => r.model);
  console.log(`\nWorking models for fallback cascade:`, working);
}

run();

