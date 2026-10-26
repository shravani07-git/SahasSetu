import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import connectDB from '@/lib/db/mongodb';
import { Evidence } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/session';
import { decryptFileFromStorage } from '@/lib/encryption';
import { sha256Buffer, verifyEvidenceReceipt } from '@/lib/evidence-integrity';

// GET /api/evidence/[id]/verify - Verify evidence bytes + signed timestamp receipt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await connectDB();
    const evidence = await Evidence.findById(id);
    if (!evidence || evidence.isDeleted) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    const isOwner = evidence.userId.toString() === auth.session!.userId;
    const isShared = evidence.sharedWith.some((uid) => uid.toString() === auth.session!.userId);
    const isAdmin = ['admin', 'committee_member'].includes(auth.session!.role);
    if (!isOwner && !isShared && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!evidence.contentHash || !evidence.timestampSignature || !evidence.receiptHash || !evidence.evidenceTimestamp) {
      return NextResponse.json({
        verified: false,
        legacy: true,
        message: 'This file predates cryptographic evidence receipts.',
      });
    }

    const encryptedData = await readFile(evidence.encryptedPath);
    const plaintext = decryptFileFromStorage(
      encryptedData,
      evidence.encryptionIV,
      evidence.encryptionTag,
      evidence.encryptedFileKey
    );

    const currentHash = sha256Buffer(plaintext);
    const contentValid = currentHash === evidence.contentHash;
    const receiptValid = verifyEvidenceReceipt(
      {
        contentHash: evidence.contentHash,
        timestamp: evidence.evidenceTimestamp,
        userId: evidence.userId.toString(),
        complaintId: evidence.complaintId?.toString() || null,
        originalName: evidence.originalName,
        previousReceiptHash: evidence.previousReceiptHash || null,
      },
      evidence.timestampSignature,
      evidence.receiptHash
    );

    return NextResponse.json({
      verified: contentValid && receiptValid,
      contentValid,
      receiptValid,
      contentHash: evidence.contentHash,
      receiptHash: evidence.receiptHash,
      previousReceiptHash: evidence.previousReceiptHash || null,
      evidenceTimestamp: evidence.evidenceTimestamp,
      algorithm: 'SHA-256 + HMAC-SHA-256 receipt; AES-256-GCM storage',
    });
  } catch (error) {
    console.error('Error verifying evidence:', error);
    return NextResponse.json({ error: 'Integrity verification failed' }, { status: 500 });
  }
}
