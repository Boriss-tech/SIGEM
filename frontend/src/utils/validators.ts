/** Valida un RUT chileno con dígito verificador (módulo 11). */
export function validarRut(rut: string): boolean {
  const limpio = rut.replace(/[.\-\s]/g, '').toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const res = 11 - (suma % 11);
  const esperado = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dv === esperado;
}

export function formatRut(rut: string): string {
  const l = rut.replace(/[.\-\s]/g, '').toUpperCase();
  if (l.length < 2) return l;
  return `${l.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${l.slice(-1)}`;
}
