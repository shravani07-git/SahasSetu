import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { classifyComplaint } from '@/lib/ml-client';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return NextResponse.json({ error: 'Complaint text is required' }, { status: 400 });
    }
    const result = await classifyComplaint(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('ML classification error:', error);
    return NextResponse.json(
      { error: 'ML service unavailable', model_available: false },
      { status: 503 }
    );
  }
}
