/**
 * DATOS SIMULADOS (solo para desarrollo del frontend).
 * Cuando el backend esté listo: VITE_USE_MOCK=false y esta carpeta se puede borrar.
 */
import { delay } from '../api';
import type { Accion, LoginRequest, LoginResponse, Modulo, Permiso, RolCodigo } from '../../modules/auth/types/auth.types';
import type { ConteoLinea, MovimientoKardex, Producto } from '../../modules/inventory/types/inventory.types';
import type { Cliente, Cotizacion, CuentaPorCobrar } from '../../modules/sales/types/sales.types';
import type { CuentaPorPagar, OrdenCompra, RecepcionPendiente } from '../../modules/purchases/types/purchases.types';
import type { Conciliacion, DocumentoTributario, ResultadoImportacion } from '../../modules/documents/types/documents.types';
import type { Alerta } from '../../modules/alerts/types/alerts.types';
import type { DashboardData } from '../../modules/dashboard/types/dashboard.types';
import type { BitacoraItem, ParametroEmpresa, RolPermisos, UsuarioAdmin } from '../../modules/admin/types/admin.types';

// ---------- Roles y permisos (propuesta; validar con el dueño del minimarket) ----------
const MODS: Modulo[] = ['usuarios', 'compras', 'inventario', 'ventas', 'documentos', 'reportes', 'parametros'];
const ACC: Accion[] = ['ver', 'crear', 'editar', 'eliminar'];
type Nivel = 'V' | 'M' | 'T'; // V=ver, M=ver+crear+editar, T=todo
const mk = (m: Partial<Record<Modulo, Nivel>>): Permiso[] =>
  MODS.flatMap((mod) => {
    const n = m[mod];
    if (!n) return [];
    const acc = n === 'T' ? ACC : n === 'M' ? ACC.slice(0, 3) : ACC.slice(0, 1);
    return acc.map((a) => `${mod}:${a}` as Permiso);
  });

export const ROL_NOMBRE: Record<RolCodigo, string> = {
  ADMIN: 'Administrador', ADMINISTRATIVO: 'Administrativo', BODEGA: 'Bodega', VENTAS: 'Ventas', CONTADOR: 'Contador',
};
export const ROL_PERMISOS: Record<RolCodigo, Permiso[]> = {
  ADMIN: mk({ usuarios: 'T', compras: 'T', inventario: 'T', ventas: 'T', documentos: 'T', reportes: 'T', parametros: 'T' }),
  ADMINISTRATIVO: mk({ compras: 'M', documentos: 'M', ventas: 'V', inventario: 'V', reportes: 'V' }),
  BODEGA: mk({ inventario: 'M', compras: 'V', reportes: 'V' }),
  VENTAS: mk({ ventas: 'M', inventario: 'V', reportes: 'V' }),
  CONTADOR: mk({ documentos: 'M', reportes: 'M', ventas: 'V', inventario: 'V', compras: 'V' }),
};
export const rolesPermisos: RolPermisos[] = (Object.keys(ROL_NOMBRE) as RolCodigo[]).map((rol) => ({
  rol, nombre: ROL_NOMBRE[rol], permisos: ROL_PERMISOS[rol],
}));

export const DEMO_ACCOUNTS = [
  { email: 'admin@minimarket.cl', nombre: 'Camila Rojas', rol: 'ADMIN' as RolCodigo, rolNombre: 'Administrador' },
  { email: 'administrativo@minimarket.cl', nombre: 'Pedro Soto', rol: 'ADMINISTRATIVO' as RolCodigo, rolNombre: 'Administrativo' },
  { email: 'bodega@minimarket.cl', nombre: 'Luis Araya', rol: 'BODEGA' as RolCodigo, rolNombre: 'Bodega' },
  { email: 'ventas@minimarket.cl', nombre: 'Ana Muñoz', rol: 'VENTAS' as RolCodigo, rolNombre: 'Ventas' },
  { email: 'contador@minimarket.cl', nombre: 'Marta Vera', rol: 'CONTADOR' as RolCodigo, rolNombre: 'Contador' },
];

const fails: Record<string, number> = {};
export async function mockLogin({ email, password }: LoginRequest): Promise<LoginResponse> {
  await delay(400);
  const e = email.trim().toLowerCase();
  if ((fails[e] ?? 0) >= 3) throw new Error('Cuenta bloqueada por intentos fallidos. Intenta nuevamente en 15 minutos.');
  const acc = DEMO_ACCOUNTS.find((a) => a.email === e);
  if (!acc || password !== 'demo1234') {
    fails[e] = (fails[e] ?? 0) + 1;
    throw new Error(`Credenciales inválidas. Intento ${fails[e]} de 3.`);
  }
  fails[e] = 0;
  return {
    token: `mock-token-${acc.rol}`,
    user: { id: 1, nombre: acc.nombre, email: acc.email, rol: acc.rol, rolNombre: acc.rolNombre,
      empresa: 'Minimarket Don Lucho SpA', permisos: ROL_PERMISOS[acc.rol] },
  };
}

// ---------- Inventario ----------
const P = (id: number, codigo: string, nombre: string, categoria: string, stock: number, min: number, max: number, precio: number, costo: number, venc?: string): Producto =>
  ({ id, codigo, codigoBarras: codigo, nombre, categoria, unidad: 'UN', costoPromedio: costo, precioVenta: precio, stock, stockMinimo: min, stockMaximo: max, vencimiento: venc, activo: true });
export const productos: Producto[] = [
  P(1, '7801001', 'Leche entera 1L', 'Lácteos', 42, 30, 120, 1090, 780, '2026-12-20'),
  P(2, '7801002', 'Arroz grado 1 1kg', 'Abarrotes', 18, 25, 200, 1490, 1050),
  P(3, '7801003', 'Aceite maravilla 900ml', 'Abarrotes', 64, 20, 100, 2590, 1900),
  P(4, '7801004', 'Bebida cola 2L', 'Bebidas', 210, 40, 150, 2290, 1600),
  P(5, '7801005', 'Pan de molde', 'Panadería', 9, 12, 50, 2190, 1500, '2026-11-18'),
  P(6, '7801006', 'Yogurt batido 150g', 'Lácteos', 35, 20, 80, 490, 320, '2026-11-22'),
  P(7, '7801007', 'Fideos espagueti 400g', 'Abarrotes', 77, 30, 150, 890, 600),
  P(8, '7801008', 'Detergente 3L', 'Limpieza', 26, 10, 60, 6990, 4800),
];
export const kardex: MovimientoKardex[] = [
  { id: 1, fecha: '2026-11-15 09:12', producto: 'Leche entera 1L', tipo: 'ENTRADA_COMPRA', cantidad: 48, saldoPosterior: 90, origen: 'Recepción #31', usuario: 'Luis Araya' },
  { id: 2, fecha: '2026-11-15 11:40', producto: 'Arroz grado 1 1kg', tipo: 'SALIDA_VENTA', cantidad: 6, saldoPosterior: 18, origen: 'Venta V-1052', usuario: 'Ana Muñoz' },
  { id: 3, fecha: '2026-11-14 18:05', producto: 'Pan de molde', tipo: 'AJUSTE_NEGATIVO', cantidad: 3, saldoPosterior: 9, origen: 'Conteo #7 (merma)', usuario: 'Luis Araya' },
  { id: 4, fecha: '2026-11-14 10:22', producto: 'Aceite maravilla 900ml', tipo: 'TRASPASO_SALIDA', cantidad: 12, saldoPosterior: 64, origen: 'Traspaso Bodega → Local', usuario: 'Camila Rojas' },
];
export const conteo: ConteoLinea[] = productos.slice(0, 6).map((p) => ({ productoId: p.id, producto: p.nombre, cantidadSistema: p.stock }));

// ---------- Ventas ----------
export const clientes: Cliente[] = [
  { id: 1, razonSocial: 'Almacén Don Pepe', rut: '76.123.456-7' },
  { id: 2, razonSocial: 'Panadería Sol', rut: '77.555.222-1' },
  { id: 3, razonSocial: 'Casino Escuela', rut: '65.100.200-3' },
];
export const cotizaciones: Cotizacion[] = [
  { id: 1, numero: 'C-031', cliente: 'Almacén Don Pepe', vigenciaHasta: '2026-11-20', total: 184500, estado: 'PENDIENTE' },
  { id: 2, numero: 'C-030', cliente: 'Casino Escuela', vigenciaHasta: '2026-11-10', total: 420000, estado: 'CONVERTIDA' },
  { id: 3, numero: 'C-029', cliente: 'Panadería Sol', vigenciaHasta: '2026-11-01', total: 96000, estado: 'VENCIDA' },
];
export const porCobrar: CuentaPorCobrar[] = [
  { id: 1, cliente: 'Almacén Don Pepe', venta: 'V-1021', vence: '2026-11-10', saldo: 96000, vencida: true, estado: 'PENDIENTE' },
  { id: 2, cliente: 'Panadería Sol', venta: 'V-1034', vence: '2026-11-20', saldo: 45500, vencida: false, estado: 'PARCIAL' },
  { id: 3, cliente: 'Casino Escuela', venta: 'V-1040', vence: '2026-12-05', saldo: 210000, vencida: false, estado: 'PENDIENTE' },
];

// ---------- Compras ----------
export const ordenes: OrdenCompra[] = [
  { id: 4, numero: 'OC-0047', proveedor: 'Lácteos del Sur', fecha: '2026-11-15', estado: 'BORRADOR', total: 98000 },
  { id: 3, numero: 'OC-0046', proveedor: 'Lácteos del Sur', fecha: '2026-11-12', estado: 'EMITIDA', total: 186300 },
  { id: 2, numero: 'OC-0045', proveedor: 'Distribuidora Andina', fecha: '2026-11-08', estado: 'RECIBIDA_PARCIAL', total: 412000 },
  { id: 1, numero: 'OC-0044', proveedor: 'Bebidas Pacífico', fecha: '2026-11-02', estado: 'RECIBIDA', total: 520000 },
];
export const recepcionPendiente: RecepcionPendiente = {
  ordenCompraId: 2, numero: 'OC-0045', proveedor: 'Distribuidora Andina',
  lineas: [
    { productoId: 2, producto: 'Arroz grado 1 1kg', pedido: 60, recibido: 20 },
    { productoId: 3, producto: 'Aceite maravilla 900ml', pedido: 24, recibido: 0 },
    { productoId: 7, producto: 'Fideos espagueti 400g', pedido: 40, recibido: 40 },
  ],
};
export const porPagar: CuentaPorPagar[] = [
  { id: 1, proveedor: 'Distribuidora Andina', documento: 'F-8841', vence: '2026-11-18', saldo: 412000, estado: 'PENDIENTE' },
  { id: 2, proveedor: 'Bebidas Pacífico', documento: 'F-1290', vence: '2026-10-30', saldo: 120000, estado: 'PARCIAL' },
];

// ---------- Documentos / RCV ----------
export const documentos: DocumentoTributario[] = [
  { id: 1, tipo: '33 Factura electrónica', folio: 8841, contraparte: 'Distribuidora Andina', fecha: '2026-11-08', total: 490280, estado: 'VINCULADO' },
  { id: 2, tipo: '52 Guía de despacho', folio: 20331, contraparte: 'Lácteos del Sur', fecha: '2026-11-12', total: 186300, estado: 'IMPORTADO' },
  { id: 3, tipo: '61 Nota de crédito', folio: 441, contraparte: 'Bebidas Pacífico', fecha: '2026-11-09', total: 35700, estado: 'ANULADO' },
];
export const resultadoImportacion = (archivo: string): ResultadoImportacion => ({
  archivo, total: 12, ok: 9, error: 3,
  errores: [
    { linea: 4, codigo: 'FOLIO_DUPLICADO', mensaje: 'El folio 8841 ya fue importado' },
    { linea: 7, codigo: 'RUT_INVALIDO', mensaje: 'El RUT 76.123.45-K no cumple el dígito verificador' },
    { linea: 11, codigo: 'FORMATO', mensaje: 'Falta el monto neto' },
  ],
});
export const conciliacion: Conciliacion = {
  periodo: '2026-10',
  resumen: { conciliados: 84, diferencia: 5, sinDocumento: 3, pendientes: 2 },
  registros: [
    { id: 1, libro: 'COMPRA', tipo: 33, folio: 8841, contraparte: 'Distribuidora Andina', monto: 490280, estado: 'CONCILIADO' },
    { id: 2, libro: 'COMPRA', tipo: 33, folio: 8902, contraparte: 'Lácteos del Sur', monto: 186300, estado: 'DIFERENCIA_MONTO', detalle: 'Sistema $186.000 vs RCV $186.300 (diferencia $300)' },
    { id: 3, libro: 'VENTA', tipo: 39, folio: 1544, contraparte: 'Consumidor final', monto: 58200, estado: 'SIN_DOCUMENTO', detalle: 'El RCV tiene el documento pero no está importado' },
  ],
};

// ---------- Alertas, panel, admin ----------
export const alertas: Alerta[] = [
  { id: 1, tipo: 'STOCK_MINIMO', mensaje: 'Arroz grado 1 1kg bajo el mínimo (18 de 25)', leida: false },
  { id: 2, tipo: 'VENCIMIENTO', mensaje: 'Pan de molde vence el 18-11-2026', fechaLimite: '2026-11-18', leida: false },
  { id: 3, tipo: 'VENCIMIENTO', mensaje: 'Yogurt batido vence el 22-11-2026', fechaLimite: '2026-11-22', leida: false },
  { id: 4, tipo: 'SOBRESTOCK', mensaje: 'Bebida cola 2L sobre el máximo (210 de 150)', leida: false },
  { id: 5, tipo: 'PLAZO_TRIBUTARIO', mensaje: 'Cierre mensual: faltan 7 días para el período 2026-10', leida: false },
  { id: 6, tipo: 'CUENTA_VENCIDA', mensaje: 'Cuenta por cobrar de Almacén Don Pepe vencida', leida: false },
];
export const dashboard: DashboardData = {
  ventasHoy: 584200, margenMes: 2310400, porCobrar: 351500, porCobrarVencido: 96000,
  comprasMes: 3120000, porPagar: 532000, bajoMinimo: 2, sobrestock: 1, rcvConciliados: 84, rcvTotal: 94,
  ventasSemana: [['Lun', 380], ['Mar', 520], ['Mié', 470], ['Jue', 610], ['Vie', 440], ['Sáb', 700], ['Dom', 584]]
    .map(([dia, v]) => ({ dia: dia as string, total: (v as number) * 1000 })),
};
export const usuarios: UsuarioAdmin[] = DEMO_ACCOUNTS.map((a, i) => ({
  id: i + 1, nombre: a.nombre, email: a.email, rol: a.rol, activo: true, bloqueado: false, ultimoLogin: '2026-11-15 08:5' + i,
}));
export const bitacora: BitacoraItem[] = [
  { id: 1, fecha: '2026-11-15 11:40', usuario: 'Ana Muñoz', accion: 'CREAR', entidad: 'venta #1052', ip: '190.20.14.8', detalle: 'Venta confirmada por $12.480' },
  { id: 2, fecha: '2026-11-14 18:05', usuario: 'Luis Araya', accion: 'AJUSTAR_STOCK', entidad: 'producto #5', ip: '190.20.14.9', detalle: 'stock 12 → 9 (merma)' },
  { id: 3, fecha: '2026-11-14 08:01', usuario: '(desconocido)', accion: 'LOGIN', entidad: 'usuario', ip: '181.43.2.7', detalle: 'Intento fallido' },
];
export const parametros: ParametroEmpresa[] = [
  { clave: 'dias_alerta_vencimiento', valor: '7', descripcion: 'Días de anticipación para avisar productos por vencer' },
  { clave: 'umbral_sobrestock_pct', valor: '120', descripcion: 'Porcentaje sobre el stock máximo para alertar sobrestock' },
  { clave: 'nombre_fantasia', valor: 'Minimarket Don Lucho', descripcion: 'Nombre comercial que se muestra en reportes' },
];
