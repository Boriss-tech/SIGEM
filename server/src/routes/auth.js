import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { config } from '../config/env.js';
import { authRequired } from '../middlewares/auth.js';
import { HttpError } from '../utils/errors.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(128),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { codigo: 'LIMITE_LOGIN', mensaje: 'Demasiados intentos. Espera unos minutos e intenta nuevamente.' } },
});

async function audit({ empresaId = null, usuarioId = null, accion, request, detalle }) {
  await pool.execute(
    `INSERT INTO bitacora_auditoria (empresa_id, usuario_id, accion, entidad, detalle, ip, fecha)
     VALUES (?, ?, ?, 'autenticacion', ?, ?, NOW())`,
    [empresaId, usuarioId, accion, JSON.stringify(detalle), request.ip],
  );
}

async function getPermissions(rolId) {
  const [rows] = await pool.execute(
    `SELECT p.modulo, p.accion
       FROM rol_permiso rp
       JOIN permiso p ON p.id = rp.permiso_id
      WHERE rp.rol_id = ?
      ORDER BY p.modulo, p.accion`,
    [rolId],
  );
  return rows;
}

function publicUser(user, permisos) {
  return {
    id: user.id,
    empresaId: user.empresa_id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol_codigo,
    permisos,
  };
}

authRouter.post('/login', loginLimiter, async (request, response, next) => {
  let connection;
  try {
    const { email, password } = loginSchema.parse(request.body);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [users] = await connection.execute(
      `SELECT u.id, u.empresa_id, u.rol_id, u.nombre, u.email, u.password_hash,
              u.intentos_fallidos, u.bloqueado_hasta, u.activo, r.codigo AS rol_codigo
         FROM usuario u
         JOIN empresa e ON e.id = u.empresa_id AND e.activa = 1
         JOIN rol r ON r.id = u.rol_id
        WHERE u.email = ?
        LIMIT 2
        FOR UPDATE`,
      [email],
    );
    const user = users.length === 1 ? users[0] : null;
    const lockActive = user?.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date();
    const valid = user && user.activo && !lockActive && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      if (user && !lockActive) {
        const failed = user.intentos_fallidos + 1;
        const lock = failed >= config.loginMaxAttempts;
        await connection.execute(
          `UPDATE usuario SET intentos_fallidos = ?, bloqueado_hasta = ?
            WHERE id = ? AND empresa_id = ?`,
          [lock ? 0 : failed, lock ? new Date(Date.now() + config.loginLockMinutes * 60_000) : null, user.id, user.empresa_id],
        );
      }
      await connection.execute(
        `INSERT INTO bitacora_auditoria (empresa_id, usuario_id, accion, entidad, detalle, ip, fecha)
         VALUES (?, ?, 'LOGIN_FALLIDO', 'autenticacion', ?, ?, NOW())`,
        [user?.empresa_id ?? null, user?.id ?? null, JSON.stringify({ email }), request.ip],
      );
      await connection.commit();
      throw new HttpError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
    }

    await connection.execute(
      `UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW()
        WHERE id = ? AND empresa_id = ?`,
      [user.id, user.empresa_id],
    );
    await connection.execute(
      `INSERT INTO bitacora_auditoria (empresa_id, usuario_id, accion, entidad, detalle, ip, fecha)
       VALUES (?, ?, 'LOGIN', 'autenticacion', ?, ?, NOW())`,
      [user.empresa_id, user.id, JSON.stringify({ exitoso: true }), request.ip],
    );
    const [permissionRows] = await connection.execute(
      `SELECT p.modulo, p.accion
         FROM rol_permiso rp JOIN permiso p ON p.id = rp.permiso_id
        WHERE rp.rol_id = ?
        ORDER BY p.modulo, p.accion`,
      [user.rol_id],
    );
    await connection.commit();
    const usuario = publicUser(user, permissionRows);
    const token = jwt.sign(
      { sub: String(user.id), empresa_id: user.empresa_id, rol: user.rol_codigo, permisos: permissionRows },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );
    return response.json({ data: { token, usuario } });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('No se pudo revertir la transacción de inicio de sesión:', rollbackError);
      }
    }
    return next(error);
  } finally {
    connection?.release();
  }
});

authRouter.get('/me', authRequired, async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.empresa_id, u.rol_id, u.nombre, u.email, u.activo, r.codigo AS rol_codigo
         FROM usuario u JOIN rol r ON r.id = u.rol_id
        WHERE u.id = ? AND u.empresa_id = ? AND u.activo = 1`,
      [request.auth.sub, request.auth.empresa_id],
    );
    if (!rows.length) throw new HttpError(401, 'SESION_INVALIDA', 'Tu cuenta ya no está disponible. Inicia sesión nuevamente.');
    const permisos = await getPermissions(rows[0].rol_id);
    return response.json({ data: publicUser(rows[0], permisos) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/logout', authRequired, async (request, response, next) => {
  try {
    await audit({
      empresaId: request.auth.empresa_id,
      usuarioId: Number(request.auth.sub),
      accion: 'LOGOUT',
      request,
      detalle: {},
    });
    return response.json({ data: { ok: true } });
  } catch (error) {
    return next(error);
  }
});
