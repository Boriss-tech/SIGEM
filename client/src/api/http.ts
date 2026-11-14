const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('sigem-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && token) {
    sessionStorage.removeItem('sigem-token');
    window.dispatchEvent(new Event('sigem:unauthorized'));
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: { mensaje?: string }; data?: T }
    | null;
  if (!response.ok) {
    throw new ApiError(payload?.error?.mensaje ?? 'No se pudo completar la solicitud.', response.status);
  }
  return (payload && 'data' in payload ? payload.data : payload) as T;
}
