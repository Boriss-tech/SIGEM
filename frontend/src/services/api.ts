import axios from 'axios';

/** true = datos simulados (sin backend). Se controla con VITE_USE_MOCK en .env */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token a cada petición.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sigem_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401, AuthContext cierra la sesión.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.dispatchEvent(new Event('auth:logout'));
    return Promise.reject(err);
  },
);

export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/**
 * Patrón de todos los servicios: en modo mock devuelve datos simulados;
 * en modo real llama al endpoint. Así las pantallas no cambian al conectar el backend.
 */
export async function request<T>(mock: () => T, real: () => Promise<{ data: T }>): Promise<T> {
  if (USE_MOCK) {
    await delay();
    return structuredClone(mock());
  }
  const { data } = await real();
  return data;
}

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { message?: string } | undefined)?.message ?? 'Error de comunicación con el servidor';
  }
  return e instanceof Error ? e.message : 'Error inesperado';
}
