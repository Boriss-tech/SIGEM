import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/errors.js';

export function authRequired(request, _response, next) {
  const authorization = request.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'NO_AUTENTICADO', 'Inicia sesión para continuar.'));
  }
  try {
    request.auth = jwt.verify(authorization.slice(7), config.jwtSecret);
    return next();
  } catch {
    return next(new HttpError(401, 'TOKEN_INVALIDO', 'Tu sesión venció. Inicia sesión nuevamente.'));
  }
}

export function requirePermiso(modulo, accion) {
  return async (request, _response, next) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 1
           FROM rol r
           JOIN rol_permiso rp ON rp.rol_id = r.id
           JOIN permiso p ON p.id = rp.permiso_id
          WHERE r.codigo = ? AND p.modulo = ? AND p.accion = ?
          LIMIT 1`,
        [request.auth.rol, modulo, accion],
      );
      if (!rows.length) return next(new HttpError(403, 'SIN_PERMISO', 'No tienes permiso para realizar esta acción.'));
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
