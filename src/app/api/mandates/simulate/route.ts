import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluatePolicy } from '@/lib/policy-engine';
import { reviewTransactionWithAI } from '@/lib/ai-reviewer';
import { resolveTransactionDecision } from '@/lib/decision-matrix';
import { Mandate, Currency } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      mandateId,
      draftMandate,
      amount,
      currency = 'USD',
      quantity = 1,
      merchant,
      productCategory,
      productTitle,
      description = '',
      agentReasoning = 'Simulated proposal for policy boundary validation',
      simulateExpired = false,
    } = body;

    let targetMandate: Mandate | undefined;
    if (draftMandate) {
      targetMandate = draftMandate;
    } else if (mandateId) {
      const live = db.getMandate(mandateId);
      if (live) {
        targetMandate = { ...live };
      }
    }

    if (!targetMandate) {
      targetMandate = db.getMandates()[0];
    }

    if (!targetMandate) {
      return NextResponse.json({ error: 'No mandate available for simulation' }, { status: 400 });
    }

    // If test requested expired simulation
    if (simulateExpired) {
      targetMandate = {
        ...targetMandate,
        expiryDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      };
    }

    const txAmount = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    const txCurrency = (currency || targetMandate.currency || 'USD') as Currency;

    // 1. Run the same Deterministic Policy Engine
    const policyEvaluation = evaluatePolicy({
      mandate: targetMandate,
      amount: txAmount,
      currency: txCurrency,
      quantity: quantity || 1,
      productCategory: productCategory || 'General',
      merchant: merchant || 'Unknown Merchant',
      productTitle: productTitle || 'Simulated Product',
    });

    // 2. Run the same AI Risk & Intent Reviewer
    const aiReview = await reviewTransactionWithAI({
      mandate: targetMandate,
      agentReasoning,
      product: {
        title: productTitle || 'Simulated Product',
        description: description,
        merchant: merchant || 'Unknown Merchant',
        category: productCategory || 'General',
        price: txAmount,
        currency: txCurrency,
      },
    });

    // 3. Resolve Combined Decision
    const outcome = resolveTransactionDecision(policyEvaluation, aiReview);

    // CRITICAL: Simulation Mode NEVER alters real budgets or contacts PayPal
    return NextResponse.json({
      success: true,
      isSimulation: true,
      simulationDisclaimer: 'SIMULATION ONLY: No actual funds reserved, no PayPal sandbox orders created, no payment records committed.',
      mandateName: targetMandate.name,
      inputs: {
        amount: txAmount,
        currency: txCurrency,
        merchant,
        productCategory,
        productTitle,
        simulateExpired,
      },
      policyEvaluation,
      aiReview,
      outcome,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Simulation API Error]:', error);
    return NextResponse.json({ error: error?.message || 'Simulation execution failed' }, { status: 500 });
  }
}

