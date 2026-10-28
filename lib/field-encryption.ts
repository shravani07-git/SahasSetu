import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV is standard for GCM
const ENCRYPTED_PREFIX = 'enc:v1:';
const FIELD_KEY_INFO = Buffer.from('safeher-complaint-field-encryption-v1', 'utf8');
const FIELD_KEY_SALT = Buffer.from('safeher-field-key-salt-v1', 'utf8');

function getMasterKey(): Buffer {
  const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKeyHex || masterKeyHex.length !== 64) {
    throw new Error('ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(masterKeyHex, 'hex');
}

function getFieldKey(): Buffer {
  return Buffer.from(
    crypto.hkdfSync('sha256', getMasterKey(), FIELD_KEY_SALT, FIELD_KEY_INFO, 32)
  );
}

export function isEncryptedField(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Encrypt a single sensitive database field with AES-256-GCM.
 * The field name is authenticated as AAD, which prevents ciphertext from one
 * field being silently moved to another field.
 */
export function encryptField(value: string | undefined | null, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === '') return value ?? undefined;
  if (isEncryptedField(value)) return value;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getFieldKey(), iv);
  cipher.setAAD(Buffer.from(fieldName, 'utf8'));

  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
}

/**
 * Decrypts values created by encryptField. Legacy plaintext values are returned
 * unchanged so existing development data remains readable during migration.
 */
export function decryptField(value: string | undefined | null, fieldName: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isEncryptedField(value)) return value;

  const payload = value.slice(ENCRYPTED_PREFIX.length);
  const [ivEncoded, tagEncoded, ciphertextEncoded] = payload.split(':');
  if (!ivEncoded || !tagEncoded || !ciphertextEncoded) {
    throw new Error(`Malformed encrypted field: ${fieldName}`);
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getFieldKey(),
    Buffer.from(ivEncoded, 'base64url')
  );
  decipher.setAAD(Buffer.from(fieldName, 'utf8'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextEncoded, 'base64url')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

export const SENSITIVE_COMPLAINT_FIELDS = [
  'location',
  'description',
  'perpetratorInfo',
  'witnesses',
  'previousIncidents',
  'resolution',
] as const;

type SensitiveComplaintField = (typeof SENSITIVE_COMPLAINT_FIELDS)[number];

export function encryptComplaintFields<T extends Record<string, any>>(input: T): T {
  const output: Record<string, any> = { ...input };

  for (const field of SENSITIVE_COMPLAINT_FIELDS) {
    if (typeof output[field] === 'string') {
      output[field] = encryptField(output[field], `complaint.${field}`);
    }
  }

  return output as T;
}

export function decryptComplaintFields<T extends Record<string, any>>(input: T): T {
  const output: Record<string, any> = { ...input };

  for (const field of SENSITIVE_COMPLAINT_FIELDS) {
    if (typeof output[field] === 'string') {
      output[field] = decryptField(output[field], `complaint.${field}`);
    }
  }

  return output as T;
}

export function encryptComplaintValue(field: string, value: unknown): unknown {
  if (
    SENSITIVE_COMPLAINT_FIELDS.includes(field as SensitiveComplaintField) &&
    typeof value === 'string'
  ) {
    return encryptField(value, `complaint.${field}`);
  }
  return value;
}

export function encryptCounselingNotes(value: string | undefined | null): string | undefined {
  return encryptField(value, 'counseling.notes');
}

export function decryptCounselingRecord<T extends Record<string, any>>(input: T): T {
  const output: Record<string, any> = { ...input };

  if (typeof output.notes === 'string') {
    output.notes = decryptField(output.notes, 'counseling.notes');
  }

  if (
    output.feedback &&
    typeof output.feedback === 'object' &&
    typeof output.feedback.comment === 'string'
  ) {
    output.feedback = {
      ...output.feedback,
      comment: decryptField(
        output.feedback.comment,
        'counseling.feedback.comment'
      ),
    };
  }

  return output as T;
}

export function encryptCounselingFeedbackComment(value: string | undefined | null): string | undefined {
  return encryptField(value, 'counseling.feedback.comment');
}
