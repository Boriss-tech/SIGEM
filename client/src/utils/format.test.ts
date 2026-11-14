import { describe, expect, it } from 'vitest';
import { formatClp } from './format';

describe('formatClp', () => {
  it('formatea montos como pesos chilenos sin decimales', () => {
    expect(formatClp(1234567)).toContain('1.234.567');
    expect(formatClp(0)).toContain('0');
  });
});
