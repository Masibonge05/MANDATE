import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Retrieve a single agent profile by ID.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = db.getAgent(id);

    if (!agent) {
      return NextResponse.json(
        { error: `Agent not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}
