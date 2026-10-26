import crypto from 'crypto';

function getSigningKey(): Buffer {
  // A dedicated key is preferred. For local development only, derive one from
  // ENCRYPTION_MASTER_KEY if EVIDENCE_SIGNING_KEY is absent.
  const explicitKey = process.env.EVIDENCE_SIGNING_KEY;
  if (explicitKey && explicitKey.length >= 32) {
    return Buffer.from(explicitKey, 'utf8');
  }

  const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKeyHex || masterKeyHex.length !== 64) {
    throw new Error('EVIDENCE_SIGNING_KEY or a valid ENCRYPTION_MASTER_KEY is required');
  }

  return crypto
    .createHmac('sha256', Buffer.from(masterKeyHex, 'hex'))
    .update('safeher-evidence-signing-v1')
    .digest();
}

export function sha256Buffer(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export interface EvidenceReceiptInput {
  contentHash: string;
  timestamp: Date | string;
  userId: string;
  complaintId?: string | null;
  originalName: string;
  previousReceiptHash?: string | null;
}

function canonicalReceiptPayload(input: EvidenceReceiptInput): string {
  return JSON.stringify({
    version: 1,
    contentHash: input.contentHash,
    timestamp: new Date(input.timestamp).toISOString(),
    userId: input.userId,
    complaintId: input.complaintId || null,
    originalName: input.originalName,
    previousReceiptHash: input.previousReceiptHash || null,
  });
}

export function createEvidenceReceipt(input: EvidenceReceiptInput): {
  timestampSignature: string;
  receiptHash: string;
} {
  const payload = canonicalReceiptPayload(input);
  const timestampSignature = crypto
    .createHmac('sha256', getSigningKey())
    .update(payload)
    .digest('hex');

  const receiptHash = crypto
    .createHash('sha256')
    .update(`${payload}|${timestampSignature}`)
    .digest('hex');

  return { timestampSignature, receiptHash };
}

export function verifyEvidenceReceipt(
  input: EvidenceReceiptInput,
  timestampSignature: string,
  expectedReceiptHash: string
): boolean {
  const generated = createEvidenceReceipt(input);
  const sigA = Buffer.from(generated.timestampSignature, 'hex');
  const sigB = Buffer.from(timestampSignature, 'hex');
  const hashA = Buffer.from(generated.receiptHash, 'hex');
  const hashB = Buffer.from(expectedReceiptHash, 'hex');

  return (
    sigA.length === sigB.length &&
    hashA.length === hashB.length &&
    crypto.timingSafeEqual(sigA, sigB) &&
    crypto.timingSafeEqual(hashA, hashB)
  );
}
