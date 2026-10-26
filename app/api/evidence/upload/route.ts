import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db/mongodb';
import { Evidence, Complaint } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';
import { encryptFileForStorage } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';
import { createEvidenceReceipt, sha256Buffer } from '@/lib/evidence-integrity';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getCategoryFromMimeType(mimeType: string): 'image' | 'document' | 'audio' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('text/') ||
    mimeType.includes('spreadsheet')
  ) {
    return 'document';
  }
  return 'other';
}

// POST /api/evidence/upload - Upload and encrypt evidence file
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const complaintId = formData.get('complaintId') as string | null;
    const description = formData.get('description') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await connectDB();

    // If evidence is linked to a complaint, ensure the current user owns it.
    // This prevents a user from attaching evidence to another person's case.
    let complaint: any = null;
    if (complaintId) {
      complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }
      const isOwner = complaint.userId.toString() === auth.session!.userId;
      const isPrivileged = ['admin', 'committee_member'].includes(auth.session!.role);
      if (!isOwner && !isPrivileged) {
        return NextResponse.json({ error: 'Access denied for this complaint' }, { status: 403 });
      }
    }

    // Cryptographic evidence receipt. We hash the ORIGINAL bytes before
    // encryption and sign the hash together with a trusted server timestamp.
    const contentHash = sha256Buffer(buffer);
    const evidenceTimestamp = new Date();
    const previousEvidence = await Evidence.findOne(
      complaintId ? { complaintId } : { userId: auth.session!.userId, complaintId: { $exists: false } }
    )
      .sort({ evidenceTimestamp: -1 })
      .select('receiptHash')
      .lean();
    const previousReceiptHash = previousEvidence?.receiptHash || undefined;
    const { timestampSignature, receiptHash } = createEvidenceReceipt({
      contentHash,
      timestamp: evidenceTimestamp,
      userId: auth.session!.userId,
      complaintId,
      originalName: file.name,
      previousReceiptHash,
    });

    // Encrypt the file with two-layer encryption (AES-256-GCM)
    const {
      encryptedData,
      encryptionIV,
      encryptionTag,
      encryptedFileKey,
    } = encryptFileForStorage(buffer);

    // Save encrypted file to disk
    const fileId = uuidv4();
    const encryptedFileName = `${fileId}.enc`;
    const uploadPath = path.join(UPLOAD_DIR, auth.session!.userId);
    await mkdir(uploadPath, { recursive: true });
    const filePath = path.join(uploadPath, encryptedFileName);
    await writeFile(filePath, encryptedData);

    // Save metadata to database
    const evidence = await Evidence.create({
      userId: auth.session!.userId,
      complaintId: complaintId || undefined,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      encryptedPath: filePath,
      encryptionIV,
      encryptionTag,
      encryptedFileKey,
      contentHash,
      evidenceTimestamp,
      timestampSignature,
      receiptHash,
      previousReceiptHash,
      category: getCategoryFromMimeType(file.type),
      description: description || undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    // If attached to a case, update case timeline
    if (complaintId && complaint) {
        complaint.timeline.push({
          status: complaint.status,
          description: `New evidence uploaded: ${file.name}`,
          updatedBy: auth.session!.userId as any,
          updatedByRole: auth.session!.role,
          createdAt: new Date(),
        } as any);
        await complaint.save();
    }

    await createAuditLog(
      auth.session!.userId,
      'evidence.upload',
      'evidence',
      `Evidence file uploaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB, encrypted)`,
      { fileId: evidence._id.toString(), category: evidence.category, complaintId },
      request
    );

    return NextResponse.json(
      {
        success: true,
        file: {
          _id: evidence._id,
          originalName: evidence.originalName,
          mimeType: evidence.mimeType,
          fileSize: evidence.fileSize,
          category: evidence.category,
          description: evidence.description,
          tags: evidence.tags,
          contentHash: evidence.contentHash,
          evidenceTimestamp: evidence.evidenceTimestamp,
          receiptHash: evidence.receiptHash,
          createdAt: evidence.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
