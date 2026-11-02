import { NextResponse } from 'next/server';
import { compileNaturalLanguageMandate } from '@/lib/mandate-compiler';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, currency } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: 'Prompt must be at least 5 characters long' },
        { status: 400 }
      );
    }

    const compiled = await compileNaturalLanguageMandate(prompt.trim(), currency || 'USD');
    return NextResponse.json({ success: true, compiled });
  } catch (error: any) {
    console.error('[API Mandate Compile Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to compile natural language mandate' },
      { status: 500 }
    );
  }
}

