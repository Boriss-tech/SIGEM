import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authRequired, requirePermiso } from '../middlewares/auth.js';
import { HttpError } from '../utils/errors.js';
import { isValidRut } from '../utils/rut.js';

const rutSchema = z.string().trim().refine(isValidRut, 'Ingresa un RUT válido.');
const productSchema = z.object({
  codigo: z.string().trim().min(1).max(40),
  codigo_barras: z.string().trim().max(40).nullable().optional(),
  nombre: z.string().trim().min(1).max(150),
  categoria_id: z.number().int().positive().nullable().optional(),
  unidad_medida: z.enum(['UN', 'KG', 'LT', 'CJ']),
  costo_promedio: z.number().nonnegative(),
  precio_venta: z.number().nonnegative(),
  stock_minimo: z.number().nonnegative(),
  stock_maximo: z.number().nonnegative().nullable().optional(),
  controla_vencimiento: z.boolean().default(false),
});
const providerSchema = z.object({
  rut: rutSchema,
  razon_social: z.string().trim().min(1).max(150),
  contacto_nombre: z.string().trim().max(100).nullable().optional(),
  email: z.union([z.string().trim().email().max(120), z.literal('')]).nullable().optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  direccion: z.string().trim().max(200).nullable().optional(),
  dias_pago: z.number().int().min(0).max(365).default(0),
});
const customerSchema = z.object({
  rut: rutSchema.nullable().optional(),
  razon_social: z.string().trim().min(1).max(150),
  email: z.union([z.string().trim().email().max(120), z.literal('')]).nullable().optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  direccion: z.string().trim().max(200).nullable().optional(),
});

function createCatalog({ path, table, module, entity, schema, fields, selectSql, searchSql }) {
  const router = Router();

  router.get('/', authRequired, requirePermiso(module, 'ver'), async (request, response, next) => {
    try {
      const page = Math.max(1, Number.parseInt(request.query.page ?? '1', 10) || 1);
      const pageSize = Math.min(100, Math.max(1, Number.parseInt(request.query.pageSize ?? '25', 10) || 25));
      const search = String(request.query.q ?? '').trim().slice(0, 100);
      const empresaId = request.auth.empresa_id;
      const filters = [`${table}.empresa_id = ?`, `${table}.activo = 1`];
      const params = [empresaId];
      if (search) {
        filters.push(searchSql);
        params.push(...Array(3).fill(`%${search}%`));
      }
      const where = filters.join(' AND ');
      const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params);
      const [rows] = await pool.execute(
        `${selectSql} WHERE ${where} ORDER BY ${table}.id DESC LIMIT ? OFFSET ?`,
        [...params, pageSize, (page - 1) * pageSize],
      );
      return response.json({ data: { items: rows, page, pageSize, total } });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', authRequired, requirePermiso(module, 'crear'), async (request, response, next) => {
    try {
      const values = schema.parse(request.body);
      const keys = Object.keys(values).filter((key) => fields.includes(key));
      if (!keys.length) throw new HttpError(400, 'DATOS_INVALIDOS', 'Ingresa los datos requeridos.');
      const columns = [...keys, 'empresa_id'];
      const args = [...keys.map((key) => values[key] ?? null), request.auth.empresa_id];
      const placeholders = columns.map(() => '?').join(', ');
      const id = await withTransaction(async (connection) => {
        if (table === 'producto' && values.categoria_id) {
          const [categories] = await connection.execute(
            'SELECT id FROM categoria WHERE id = ? AND empresa_id = ?',
            [values.categoria_id, request.auth.empresa_id],
          );
          if (!categories.length) throw new HttpError(400, 'CATEGORIA_INVALIDA', 'Selecciona una categoría de esta empresa.');
        }
        const [result] = await connection.execute(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          args,
        );
        await audit(connection, request, 'CREAR', entity, result.insertId, { despues: values });
        return result.insertId;
      });
      return response.status(201).json({ data: { id, ...values } });
    } catch (error) {
      return next(error);
    }
  });

  router.put('/:id', authRequired, requirePermiso(module, 'editar'), async (request, response, next) => {
    try {
      const id = parseId(request.params.id);
      const values = schema.partial().parse(request.body);
      const keys = Object.keys(values).filter((key) => fields.includes(key));
      if (!keys.length) throw new HttpError(400, 'DATOS_INVALIDOS', 'Ingresa al menos un campo para actualizar.');
      await withTransaction(async (connection) => {
        const [beforeRows] = await connection.execute(
          `SELECT * FROM ${table} WHERE id = ? AND empresa_id = ? AND activo = 1 FOR UPDATE`,
          [id, request.auth.empresa_id],
        );
        if (!beforeRows.length) throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos el registro solicitado.');
        if (table === 'producto' && values.categoria_id) {
          const [categories] = await connection.execute(
            'SELECT id FROM categoria WHERE id = ? AND empresa_id = ?',
            [values.categoria_id, request.auth.empresa_id],
          );
          if (!categories.length) throw new HttpError(400, 'CATEGORIA_INVALIDA', 'Selecciona una categoría de esta empresa.');
        }
        await connection.execute(
          `UPDATE ${table} SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ? AND empresa_id = ?`,
          [...keys.map((key) => values[key] ?? null), id, request.auth.empresa_id],
        );
        await audit(connection, request, 'EDITAR', entity, id, { antes: beforeRows[0], despues: values });
      });
      return response.json({ data: { id, ...values } });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', authRequired, requirePermiso(module, 'eliminar'), async (request, response, next) => {
    try {
      const id = parseId(request.params.id);
      await withTransaction(async (connection) => {
        const [beforeRows] = await connection.execute(
          `SELECT * FROM ${table} WHERE id = ? AND empresa_id = ? AND activo = 1 FOR UPDATE`,
          [id, request.auth.empresa_id],
        );
        if (!beforeRows.length) throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos el registro solicitado.');
        await connection.execute(
          `UPDATE ${table} SET activo = 0 WHERE id = ? AND empresa_id = ?`,
          [id, request.auth.empresa_id],
        );
        await audit(connection, request, 'DESACTIVAR', entity, id, { antes: beforeRows[0], despues: { activo: 0 } });
      });
      return response.json({ data: { id, activo: false } });
    } catch (error) {
      return next(error);
    }
  });

  return { path, router };
}

function parseId(value) {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    throw new HttpError(400, 'ID_INVALIDO', 'El identificador del registro no es válido.');
  }
  return Number(value);
}

async function audit(connection, request, accion, entidad, id, detalle) {
  await connection.execute(
    `INSERT INTO bitacora_auditoria (empresa_id, usuario_id, accion, entidad, entidad_id, detalle, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      request.auth.empresa_id,
      Number(request.auth.sub),
      accion,
      entidad,
      id,
      JSON.stringify(detalle),
      request.ip,
    ],
  );
}

async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('No se pudo revertir la transacción del catálogo:', rollbackError);
    }
    throw error;
  } finally {
    connection.release();
  }
}

export const catalogRoutes = [
  createCatalog({
    path: '/productos',
    table: 'producto',
    module: 'inventario',
    entity: 'producto',
    schema: productSchema,
    fields: ['codigo', 'codigo_barras', 'nombre', 'categoria_id', 'unidad_medida', 'costo_promedio', 'precio_venta', 'stock_minimo', 'stock_maximo', 'controla_vencimiento'],
    selectSql: `SELECT producto.id, producto.codigo, producto.codigo_barras, producto.nombre,
                       producto.unidad_medida, producto.costo_promedio, producto.precio_venta,
                       producto.stock_minimo, producto.stock_maximo, producto.controla_vencimiento,
                       categoria.nombre AS categoria,
                       COALESCE((SELECT SUM(sb.cantidad) FROM stock_bodega sb WHERE sb.producto_id = producto.id), 0) AS stock_total
                  FROM producto
             LEFT JOIN categoria ON categoria.id = producto.categoria_id`,
    searchSql: '(producto.nombre LIKE ? OR producto.codigo LIKE ? OR producto.codigo_barras LIKE ?)',
  }),
  createCatalog({
    path: '/proveedores',
    table: 'proveedor',
    module: 'compras',
    entity: 'proveedor',
    schema: providerSchema,
    fields: ['rut', 'razon_social', 'contacto_nombre', 'email', 'telefono', 'direccion', 'dias_pago'],
    selectSql: 'SELECT proveedor.id, proveedor.rut, proveedor.razon_social, proveedor.contacto_nombre, proveedor.email, proveedor.telefono, proveedor.dias_pago FROM proveedor',
    searchSql: '(proveedor.razon_social LIKE ? OR proveedor.rut LIKE ? OR proveedor.email LIKE ?)',
  }),
  createCatalog({
    path: '/clientes',
    table: 'cliente',
    module: 'ventas',
    entity: 'cliente',
    schema: customerSchema,
    fields: ['rut', 'razon_social', 'email', 'telefono', 'direccion'],
    selectSql: 'SELECT cliente.id, cliente.rut, cliente.razon_social, cliente.email, cliente.telefono FROM cliente',
    searchSql: '(cliente.razon_social LIKE ? OR cliente.rut LIKE ? OR cliente.email LIKE ?)',
  }),
];
