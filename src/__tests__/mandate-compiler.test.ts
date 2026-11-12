import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CompiledMandateSchema, compileNaturalLanguageMandate } from '../lib/mandate-compiler.ts';

describe('MANDATE Natural Language Compiler', () => {
  it('defaults an omitted single-transaction limit to the total budget', () => {
    const compiled = CompiledMandateSchema.parse({
      name: 'Office Supplies Mandate',
      description: 'Restock office supplies for the business.',
      totalBudget: 100,
    });

    assert.equal(compiled.maxTransactionAmount, 100);
  });

  it('parses sister photography gift prompt with $100 budget and approval rules', async () => {
    const prompt = 'Find a birthday gift for my sister. She likes photography. You may spend a maximum of $100. Only purchase from approved merchants. Electronics require my approval.';
    const compiled = await compileNaturalLanguageMandate(prompt, 'USD');

    assert.equal(compiled.currency, 'USD');
    assert.equal(compiled.totalBudget, 100);
    assert.equal(compiled.maxTransactionAmount, 100);
    assert.ok(compiled.approvalRequiredCategories.some(c => c.toLowerCase() === 'electronics'));
    assert.ok(compiled.allowedCategories.some(c => c.toLowerCase().includes('photo')));
    assert.ok(compiled.approvedMerchants.length > 0);
    assert.equal(compiled.allowUnknownMerchants, false);
  });

  it('parses custom single transaction limit and merchant overrides', async () => {
    const prompt = 'I need office supplies up to $250 total budget with a single purchase limit of $50 from any merchant';
    const compiled = await compileNaturalLanguageMandate(prompt, 'USD');

    assert.equal(compiled.totalBudget, 250);
    assert.equal(compiled.maxTransactionAmount, 50);
    assert.equal(compiled.allowUnknownMerchants, true);
  });
});

