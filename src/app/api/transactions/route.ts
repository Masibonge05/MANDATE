import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const mandateId = searchParams.get('mandateId');
    const authUserId = req.headers.get('x-user-id');

    let txs = db.getTransactions();

    if (authUserId) {
      txs = txs.filter(t => t.userId === authUserId);
    }

    if (status) {
      txs = txs.filter(t => t.status === status);
    }

    if (mandateId) {
      txs = txs.filter(t => t.mandateId === mandateId);
    }

    return NextResponse.json({
      success: true,
      count: txs.length,
      transactions: txs,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

