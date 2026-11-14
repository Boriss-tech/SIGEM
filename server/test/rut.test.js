import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRut, isValidRut } from '../src/utils/rut.js';

test('valida RUT con dígito verificador y acepta formato sin puntos', () => {
  assert.equal(isValidRut('76.123.456-0'), true);
  assert.equal(isValidRut('76123456-0'), true);
});

test('rechaza dígito verificador incorrecto y formatos inválidos', () => {
  assert.equal(isValidRut('76.123.456-7'), false);
  assert.equal(isValidRut('123'), false);
});

test('formatea RUT al estilo chileno', () => {
  assert.equal(formatRut('761234560'), '76.123.456-0');
});
