import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/session';
import { decryptComplaintFields } from '@/lib/field-encryption';
import { detectDuplicateComplaints } from '@/lib/ml-client';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const threshold = typeof body.threshold === 'number' ? body.threshold : 0.72;
    if (text.length < 10) {
      return NextResponse.json({ error: 'Provide at least 10 characters to compare' }, { status: 400 });
    }

    await connectDB();
    const existing = await Complaint.find({ userId: auth.session!.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('_id caseId description createdAt')
      .lean();

    const documents = existing
      .map((item) => decryptComplaintFields(item as Record<string, any>))
      .filter((item) => typeof item.description === 'string' && item.description.trim())
      .map((item) => ({
        id: String(item._id),
        text: item.description as string,
        caseId: item.caseId as string,
      }));

    const result = await detectDuplicateComplaints(
      text,
      documents.map(({ id, text: docText }) => ({ id, text: docText })),
      threshold
    );

    const caseLookup = new Map(documents.map((doc) => [doc.id, doc.caseId]));
    return NextResponse.json({
      ...result,
      matches: (result.matches || []).map((match: { id: string; similarity: number }) => ({
        ...match,
        caseId: caseLookup.get(match.id),
      })),
    });
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return NextResponse.json({ error: 'Duplicate detection service unavailable' }, { status: 503 });
  }
}
