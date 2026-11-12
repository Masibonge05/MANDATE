import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const apiKey = req.headers.get('x-api-key');

    if (!authHeader && !apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing required bearer authentication token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tx = db.getTransaction(id);

    if (!tx) {
      return NextResponse.json(
        { error: `Transaction not found for ID: ${id}` },
        { status: 404 }
      );
    }

    // Return both top-level and nested structure for compatibility
    return NextResponse.json({
      ...tx,
      transaction: tx,
      created_at: tx.createdAt,
      updated_at: tx.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transaction record' },
      { status: 500 }
    );
  }
}
