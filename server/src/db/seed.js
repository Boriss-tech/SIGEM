import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { pool } from './pool.js';

const password = process.env.SEED_DEFAULT_PASSWORD;
if (!password || password === 'CAMBIAR_ANTES_DE_EJECUTAR_EL_SEED' || password.length < 12) {
  throw new Error('Define SEED_DEFAULT_PASSWORD con al menos 12 caracteres en server/.env antes de crear los usuarios demo.');
}

const roles = [
  [1, 'ADMIN', 'Administrador'],
  [2, 'ADMINISTRATIVO', 'Administrativo'],
  [3, 'BODEGA', 'Bodega'],
  [4, 'VENTAS', 'Ventas'],
  [5, 'CONTADOR', 'Contador'],
];
const modules = ['usuarios', 'compras', 'inventario', 'ventas', 'documentos', 'reportes', 'parametros'];
const actions = ['ver', 'crear', 'editar', 'eliminar'];
const roleAccess = {
  ADMIN: modules.reduce((all, module) => ({ ...all, [module]: actions }), {}),
  ADMINISTRATIVO: {
    compras: ['ver', 'crear', 'editar'], inventario: ['ver'], ventas: ['ver'],
    documentos: ['ver', 'crear', 'editar'], reportes: ['ver'], parametros: ['ver'],
  },
  BODEGA: {
    compras: ['ver', 'crear'], inventario: ['ver', 'crear', 'editar'], reportes: ['ver'],
  },
  VENTAS: {
    inventario: ['ver'], ventas: ['ver', 'crear', 'editar'], documentos: ['ver'], reportes: ['ver'],
  },
  CONTADOR: {
    compras: ['ver'], inventario: ['ver'], ventas: ['ver'], documentos: ['ver', 'crear', 'editar'],
    reportes: ['ver', 'crear'],
  },
};
const users = [
  ['admin@sigem.cl', 'Administración SIGEM', 1],
  ['administrativo@sigem.cl', 'Equipo administrativo', 2],
  ['bodega@sigem.cl', 'Equipo de bodega', 3],
  ['ventas@sigem.cl', 'Equipo de ventas', 4],
  ['contador@sigem.cl', 'Contabilidad', 5],
];

const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.execute(
    `INSERT INTO empresa (rut, razon_social, nombre_fantasia)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE razon_social = VALUES(razon_social), nombre_fantasia = VALUES(nombre_fantasia)`,
    [process.env.SEED_EMPRESA_RUT ?? '76.123.456-0', process.env.SEED_EMPRESA_NOMBRE ?? 'Minimarket Don Pepe', 'Minimarket Don Pepe'],
  );
  const [[company]] = await connection.execute('SELECT id FROM empresa WHERE rut = ?', [process.env.SEED_EMPRESA_RUT ?? '76.123.456-0']);
  const empresaId = company.id;

  for (const [id, codigo, nombre] of roles) {
    await connection.execute(
      `INSERT INTO rol (id, codigo, nombre) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE codigo = VALUES(codigo), nombre = VALUES(nombre)`,
      [id, codigo, nombre],
    );
  }
  for (const module of modules) {
    for (const action of actions) {
      await connection.execute(
        `INSERT INTO permiso (modulo, accion) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE accion = VALUES(accion)`,
        [module, action],
      );
    }
  }
  const [permissionRows] = await connection.execute('SELECT id, modulo, accion FROM permiso');
  for (const [role, access] of Object.entries(roleAccess)) {
    const roleId = roles.find((item) => item[1] === role)[0];
    await connection.execute('DELETE FROM rol_permiso WHERE rol_id = ?', [roleId]);
    for (const permission of permissionRows) {
      if (access[permission.modulo]?.includes(permission.accion)) {
        await connection.execute(
          'INSERT INTO rol_permiso (rol_id, permiso_id) VALUES (?, ?)',
          [roleId, permission.id],
        );
      }
    }
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  for (const [email, name, roleId] of users) {
    await connection.execute(
      `INSERT INTO usuario (empresa_id, rol_id, nombre, email, password_hash)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id), nombre = VALUES(nombre), password_hash = VALUES(password_hash), activo = 1`,
      [empresaId, roleId, name, email, passwordHash],
    );
  }

  await connection.execute(
    `INSERT INTO parametro_empresa (empresa_id, clave, valor, descripcion)
     VALUES (?, 'dias_alerta_vencimiento', '7', 'Días previos al vencimiento para generar alertas')
     ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
    [empresaId],
  );
  const categories = ['Abarrotes', 'Lácteos', 'Bebidas', 'Panadería'];
  for (const name of categories) {
    await connection.execute(
      'INSERT INTO categoria (empresa_id, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)',
      [empresaId, name],
    );
  }
  for (const name of ['Sala de ventas', 'Bodega trasera']) {
    await connection.execute(
      'INSERT INTO bodega (empresa_id, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)',
      [empresaId, name],
    );
  }
  const [categoryRows] = await connection.execute(
    'SELECT id, nombre FROM categoria WHERE empresa_id = ?',
    [empresaId],
  );
  const categoryIds = new Map(categoryRows.map((category) => [category.nombre, category.id]));
  const products = [
    ['ARR-001', 'Arroz grado 1', 'Abarrotes', 'KG', 1100, 1590, 5],
    ['ACE-001', 'Aceite vegetal 900 ml', 'Abarrotes', 'UN', 1500, 2190, 8],
    ['FID-001', 'Fideos spaghetti 400 g', 'Abarrotes', 'UN', 650, 990, 10],
    ['LEC-001', 'Leche entera 1 L', 'Lácteos', 'UN', 850, 1290, 12],
    ['YOG-001', 'Yogur natural 125 g', 'Lácteos', 'UN', 300, 490, 10],
    ['BEB-001', 'Bebida cola 1.5 L', 'Bebidas', 'UN', 1100, 1790, 8],
    ['PAN-001', 'Pan marraqueta', 'Panadería', 'KG', 1800, 2800, 4],
    ['HUE-001', 'Huevos docena', 'Abarrotes', 'CJ', 2600, 3490, 5],
  ];
  for (const [codigo, nombre, category, unidad, costo, precio, stockMinimo] of products) {
    await connection.execute(
      `INSERT INTO producto
         (empresa_id, categoria_id, codigo, nombre, unidad_medida, costo_promedio, precio_venta, stock_minimo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), categoria_id = VALUES(categoria_id),
         unidad_medida = VALUES(unidad_medida), costo_promedio = VALUES(costo_promedio),
         precio_venta = VALUES(precio_venta), stock_minimo = VALUES(stock_minimo), activo = 1`,
      [empresaId, categoryIds.get(category), codigo, nombre, unidad, costo, precio, stockMinimo],
    );
  }
  await connection.execute(
    `INSERT INTO proveedor (empresa_id, rut, razon_social, dias_pago)
     VALUES (?, '76.123.456-0', 'Distribuidora Don Pedro Ltda.', 30)
     ON DUPLICATE KEY UPDATE razon_social = VALUES(razon_social), dias_pago = VALUES(dias_pago), activo = 1`,
    [empresaId],
  );
  await connection.execute(
    `INSERT INTO cliente (empresa_id, rut, razon_social)
     SELECT ?, NULL, 'Consumidor final'
      WHERE NOT EXISTS (
        SELECT 1 FROM cliente WHERE empresa_id = ? AND razon_social = 'Consumidor final' AND rut IS NULL
      )`,
    [empresaId, empresaId],
  );
  await connection.commit();
  console.log('Seed SIGEM-Pyme completado. Configura la contraseña demo desde server/.env.');
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
