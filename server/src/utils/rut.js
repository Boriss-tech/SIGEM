export function isValidRut(value) {
  const normalized = String(value).replace(/[.\s]/g, '').toUpperCase();
  if (!/^\d{7,8}-[\dK]$/.test(normalized)) return false;
  const [body, checkDigit] = normalized.split('-');
  let multiplier = 2;
  let sum = 0;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return checkDigit === expected;
}

export function formatRut(value) {
  const normalized = String(value).replace(/[^0-9kK]/g, '').toUpperCase();
  if (normalized.length < 2) return normalized;
  const body = normalized.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${normalized.slice(-1)}`;
}
