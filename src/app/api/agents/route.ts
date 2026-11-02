import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Agent } from '@/lib/types';

export async function GET() {
  try {
    const agents = db.getAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, description, assignedMandateIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }

    const newAgent: Agent = {
      id: `agt-${Math.random().toString(36).substring(2, 9)}`,
      userId: db.user.id,
      name,
      type: type || 'custom-agent',
      description: description || 'Autonomous agent connected via MANDATE Gateway API.',
      apiKeyPrefix: `mnd_live_${Math.random().toString(36).substring(2, 8)}`,
      status: 'active',
      assignedMandateIds: assignedMandateIds || [],
      rateLimitPerMinute: 60,
      totalProposals: 0,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.saveAgent(newAgent);

    db.recordAudit({
      userId: db.user.id,
      agentId: newAgent.id,
      eventType: 'MANDATE_UPDATED',
      severity: 'INFO',
      title: `Agent "${newAgent.name}" Registered`,
      description: `New agent granted API access under prefix ${newAgent.apiKeyPrefix}.`,
      metadata: { agentId: newAgent.id },
    });

    return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Agent registration failed' }, { status: 400 });
  }
}

