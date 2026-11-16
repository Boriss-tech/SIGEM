import { describe, expect, it } from 'vitest';
import { formatRut, validarRut } from '../src/utils/validators';

describe('RUT', () => {
  it('valida un RUT correcto', () => expect(validarRut('12.345.678-5')).toBe(true));
  it('rechaza un RUT con dígito incorrecto', () => expect(validarRut('12.345.678-9')).toBe(false));
  it('formatea con puntos y guion', () => expect(formatRut('123456785')).toBe('12.345.678-5'));
});
