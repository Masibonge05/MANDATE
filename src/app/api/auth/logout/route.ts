import { NextResponse } from 'next/server';

/**
 * Session logout endpoint.
 * Since MANDATE uses stateless JWT / demo sessions,
 * this endpoint acknowledges the logout and instructs the client to clear tokens.
 */
export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Session terminated. Clear stored bearer tokens.' },
    {
      status: 200,
      headers: {
        'Clear-Site-Data': '"cookies", "storage"',
      },
    }
  );
}
