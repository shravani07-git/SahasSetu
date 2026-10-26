import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { transcribeVoiceReport } from '@/lib/ml-client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const incoming = await request.formData();
    const file = incoming.get('file');
    const language = incoming.get('language');
    if (!(file instanceof File) || typeof language !== 'string') {
      return NextResponse.json({ error: 'Audio file and language are required' }, { status: 400 });
    }

    const outgoing = new FormData();
    outgoing.append('file', file, file.name);
    outgoing.append('language', language);
    outgoing.append('translate_to_english', String(incoming.get('translate_to_english') !== 'false'));

    const result = await transcribeVoiceReport(outgoing);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json({ error: 'Voice reporting service unavailable' }, { status: 503 });
  }
}
