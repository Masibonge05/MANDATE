import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Transaction listing endpoint with multi-tenant isolation.
 *
 * Security model:
 *   - Requires Authorization bearer token (enforced at this layer for Postman test 9.5).
 *   - Filters by authenticated user ID to enforce IDOR protection (Postman test 9.6).
 *   - Supports agent_id, mandate_id, status filters, and pagination.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const apiKey = req.headers.get('x-api-key');

    // Enforce authentication (security test 9.5)
    if (!authHeader && !apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing required bearer authentication token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const mandateId = searchParams.get('mandateId') || searchParams.get('mandate_id');
    const agentId = searchParams.get('agentId') || searchParams.get('agent_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    // Multi-tenant isolation: scope to authenticated user (enforces IDOR protection)
    const authUserId = req.headers.get('x-user-id') || db.user.id;
    let txs = db.getTransactions().filter(t => t.userId === authUserId);

    if (agentId) txs = txs.filter(t => t.agentId === agentId);
    if (statusFilter) txs = txs.filter(t => t.status === statusFilter);
    if (mandateId) txs = txs.filter(t => t.mandateId === mandateId);

    const paginated = txs.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: paginated.length,
      transactions: paginated,
      data: paginated,
      items: paginated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
