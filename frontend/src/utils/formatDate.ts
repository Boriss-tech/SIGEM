/** Convierte AAAA-MM-DD (o ISO) a DD-MM-AAAA sin problemas de zona horaria. */
export const formatDate = (iso?: string) => (iso ? iso.slice(0, 10).split('-').reverse().join('-') : '—');
