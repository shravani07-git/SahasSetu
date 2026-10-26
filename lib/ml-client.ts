const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY || '';

async function mlFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const headers = new Headers(init?.headers);
    if (ML_SERVICE_API_KEY) headers.set('x-ml-service-key', ML_SERVICE_API_KEY);
    return await fetch(`${ML_SERVICE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function classifyComplaint(text: string) {
  const response = await mlFetch('/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(`ML classification failed: ${response.status}`);
  return response.json();
}

export async function detectDuplicateComplaints(
  query: string,
  documents: { id: string; text: string }[],
  threshold = 0.72
) {
  const response = await mlFetch('/duplicates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, documents, threshold }),
  });
  if (!response.ok) throw new Error(`Duplicate detection failed: ${response.status}`);
  return response.json();
}

export async function transcribeVoiceReport(formData: FormData) {
  const response = await mlFetch('/voice/transcribe', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Voice transcription failed: ${response.status}`);
  }
  return response.json();
}
