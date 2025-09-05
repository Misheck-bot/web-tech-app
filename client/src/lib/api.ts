const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });

  // Read the body once to avoid "body stream already read" errors
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || text || 'Request failed';
    throw new Error(message);
  }

  return (data as T);
}


