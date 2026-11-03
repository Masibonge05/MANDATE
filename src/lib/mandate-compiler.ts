/**
 * MANDATE - Natural Language Mandate Compiler
 * Compiles informal user intent into rigorous, enforceable financial spending policies.
 * Uses Gemini 2.5 Flash with strict Zod schema validation and a deterministic fallback compiler.
 */

import { z } from 'zod';
import type { Mandate, Currency } from './types.ts';

export const CompiledMandateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).default('USD'),
  totalBudget: z.number().positive(),
  maxTransactionAmount: z.number().positive(),
  maxQuantityPerPurchase: z.number().int().positive().default(1),
  allowedCategories: z.array(z.string()).default([]),
  restrictedCategories: z.array(z.string()).default([]),
  approvedMerchants: z.array(z.string()).default([]),
  blockedMerchants: z.array(z.string()).default([]),
  allowUnknownMerchants: z.boolean().default(false),
  requiresHumanApproval: z.boolean().default(false),
  approvalThreshold: z.number().nonnegative().default(0),
  approvalRequiredCategories: z.array(z.string()).default([]),
  expiryDays: z.number().int().positive().default(30),
});

export type CompiledMandateData = z.infer<typeof CompiledMandateSchema>;

export async function compileNaturalLanguageMandate(
  promptText: string,
  userCurrency: Currency = 'USD'
): Promise<CompiledMandateData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const systemPrompt = `You are the MANDATE Policy Compiler.
Convert this natural-language financial instruction into a structured financial mandate.

STRICT INSTRUCTIONS:
1. Extract the primary intent for "name" and "description".
2. Parse numerical values for total budget and single transaction limit. If max transaction limit isn't stated, set it equal to total budget.
3. Identify allowed categories (e.g., "photography", "books", "gifts") and restricted categories.
4. Extract merchants explicitly allowed (e.g. "Apex Optics", "B&H Photo Video") or blocked.
5. If the user specifies that unknown merchants are allowed or to buy anywhere, set allowUnknownMerchants: true. Otherwise false.
6. Check for conditional approvals: e.g. "Electronics require my approval" -> add "electronics" to approvalRequiredCategories.
7. Return STRICT JSON matching the schema with no conversational fluff.`;

    const candidateModels = [process.env.GEMINI_MODEL || 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nUSER PROMPT:\n"${promptText}"\nCURRENCY: ${userCurrency}` }]
            }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            }
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const rawParsed = JSON.parse(jsonText);
            return CompiledMandateSchema.parse(rawParsed);
          }
        }
      } catch (err) {
        console.warn(`[Mandate Compiler] Model ${modelName} encountered issue, trying fallback:`, err);
      }
    }
  }

  // Deterministic NLP Rule-based Fallback Compiler
  return compileWithNLPFallback(promptText, userCurrency);
}

function compileWithNLPFallback(promptText: string, userCurrency: Currency): CompiledMandateData {
  const lower = promptText.toLowerCase();

  // 1. Budget extraction ($100, 100 dollars, budget of $50, etc.)
  let totalBudget = 100;
  const budgetMatch = promptText.match(/\$?\s*([0-9]+(?:\.[0-9]{2})?)\s*(?:dollars|usd|\$|budget)?/i);
  if (budgetMatch && budgetMatch[1]) {
    const parsed = parseFloat(budgetMatch[1]);
    if (parsed > 0) totalBudget = parsed;
  }

  // 2. Max transaction amount
  let maxTx = totalBudget;
  const maxTxMatch = promptText.match(/(?:max|single|per purchase|limit of)\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (maxTxMatch && maxTxMatch[1]) {
    const parsed = parseFloat(maxTxMatch[1]);
    if (parsed > 0 && parsed <= totalBudget) maxTx = parsed;
  }

  // 3. Name & Description
  let name = 'Automated Purchasing Mandate';
  if (lower.includes('birthday') || lower.includes('gift')) {
    name = 'Birthday Gift Mandate';
  } else if (lower.includes('photo')) {
    name = 'Photography Gear Mandate';
  } else if (lower.includes('office') || lower.includes('supplies')) {
    name = 'Office Supplies Mandate';
  }

  // 4. Categories
  const allowedCategories: string[] = [];
  if (lower.includes('photo') || lower.includes('camera')) {
    allowedCategories.push('Photography Accessories', 'Bags & Straps', 'Camera Gear');
  }
  if (lower.includes('gift')) {
    allowedCategories.push('Gifts');
  }
  if (lower.includes('book')) {
    allowedCategories.push('Books & Media');
  }
  if (allowedCategories.length === 0) {
    allowedCategories.push('General Retail');
  }

  // 5. Approval rules & triggers
  const approvalRequiredCategories: string[] = [];
  if (lower.includes('electronic') && (lower.includes('require') || lower.includes('approval'))) {
    approvalRequiredCategories.push('Electronics');
  }

  const requiresHumanApproval = lower.includes('all purchases require approval') || lower.includes('approve everything');

  // 6. Merchants
  const approvedMerchants: string[] = [];
  if (lower.includes('apex optics')) approvedMerchants.push('Apex Optics');
  if (lower.includes('b&h') || lower.includes('bh photo')) approvedMerchants.push('B&H Photo Video');
  if (lower.includes('adorama')) approvedMerchants.push('Adorama');
  if (lower.includes('peak design')) approvedMerchants.push('Peak Design');
  if (approvedMerchants.length === 0) {
    approvedMerchants.push('Apex Optics', 'B&H Photo Video', 'Adorama', 'Peak Design');
  }

  const blockedMerchants = ['ShadyReseller Store', 'UnknownDropship'];
  const allowUnknownMerchants = lower.includes('any merchant') || lower.includes('any store') || lower.includes('anywhere');

  // 7. Expiry
  let expiryDays = 30;
  if (lower.includes('friday') || lower.includes('week') || lower.includes('7 days')) {
    expiryDays = 7;
  } else if (lower.includes('tomorrow') || lower.includes('24 hours')) {
    expiryDays = 1;
  }

  return {
    name,
    description: promptText.trim(),
    currency: userCurrency,
    totalBudget,
    maxTransactionAmount: maxTx,
    maxQuantityPerPurchase: 1,
    allowedCategories,
    restrictedCategories: ['Gambling', 'Cryptocurrency', 'Adult Entertainment'],
    approvedMerchants,
    blockedMerchants,
    allowUnknownMerchants,
    requiresHumanApproval,
    approvalThreshold: requiresHumanApproval ? 0 : 50,
    approvalRequiredCategories,
    expiryDays,
  };
}
