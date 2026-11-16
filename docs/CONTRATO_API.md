# Contrato de API esperado por el frontend

Base: `VITE_API_URL` (ej. `http://localhost:3000/api/v1`). JSON en camelCase. Autenticación: `Authorization: Bearer <token>`.
Errores: `{ "message": "texto para mostrar al usuario" }`. Los tipos exactos están en `frontend/src/modules/*/types/*.types.ts`.
Fechas: `AAAA-MM-DD`. Montos CLP: enteros.

| Módulo | Método y ruta | Entrada | Respuesta |
|---|---|---|---|
| Auth | POST `/auth/login` | `{email,password}` | `{token, user:{id,nombre,email,rol,rolNombre,empresa,permisos[]}}` |
| Auth | POST `/auth/logout` | – | 204 |
| Panel | GET `/dashboard` | – | `DashboardData` |
| Inventario | GET `/productos` | – | `Producto[]` (con `stock` total y situación calculable) |
| Inventario | GET `/inventario/kardex` | filtros opcionales | `MovimientoKardex[]` |
| Inventario | GET `/conteos/actual` | – | `ConteoLinea[]` |
| Inventario | POST `/conteos/ajustar` | `{lineas, motivo}` | `{ok}`; genera ajustes en kardex |
| Ventas | GET `/clientes` | – | `Cliente[]` |
| Ventas | POST `/ventas` | `NuevaVenta` | `{id}`; descuenta stock y crea kardex (transacción) |
| Ventas | GET `/cotizaciones` · POST `/cotizaciones/:id/convertir` | – | `Cotizacion[]` · `{ventaId}` |
| Ventas | GET `/cuentas-por-cobrar` · POST `/cuentas-por-cobrar/:id/cobros` | `{monto,medioPago}` | `CuentaPorCobrar[]` · `{ok}` |
| Compras | GET `/ordenes-compra` | – | `OrdenCompra[]` |
| Compras | GET `/ordenes-compra/pendiente-recepcion` | – | `RecepcionPendiente` |
| Compras | POST `/recepciones` | `{ordenCompraId, lineas[{productoId,cantidad}]}` | `{ok}`; no permitir recibir más de lo pedido |
| Compras | GET `/cuentas-por-pagar` · POST `/cuentas-por-pagar/:id/pagos` | `{monto,medioPago}` | `CuentaPorPagar[]` · `{ok}` |
| Documentos | GET `/documentos` | filtros opcionales | `DocumentoTributario[]` |
| Documentos | GET `/documentos/:id/xml` | – | archivo XML (blob) |
| Documentos | POST `/importaciones` | multipart: `file`, `tipo` (`XML_DTE`\|`RCV_COMPRAS`\|`RCV_VENTAS`), `periodo` | `ResultadoImportacion` |
| Documentos | GET `/rcv/conciliacion?periodo=AAAA-MM` | – | `Conciliacion` |
| Alertas | GET `/alertas` · PATCH `/alertas/:id/leida` | – | `Alerta[]` · `{ok}` |
| Reportes | GET `/reportes/:id?format=xlsx\|pdf` | – | archivo (blob). ids: ventas-periodo, margen-producto, compras-proveedor, stock-valorizado, por-vencer, libro-contador |
| Admin | GET/POST `/usuarios` · PATCH `/usuarios/:id` `{activo}` · POST `/usuarios/:id/desbloquear` | `NuevoUsuario` | `UsuarioAdmin[]` |
| Admin | GET `/roles-permisos` | – | `RolPermisos[]` |
| Admin | GET `/bitacora` | – | `BitacoraItem[]` |
| Admin | GET `/parametros` · PUT `/parametros` | `ParametroEmpresa[]` | idem |

Notas:
- Permisos con formato `modulo:accion`: módulos `usuarios, compras, inventario, ventas, documentos, reportes, parametros`; acciones `ver, crear, editar, eliminar`.
- Roles: `ADMIN, ADMINISTRATIVO, BODEGA, VENTAS, CONTADOR` (confirmar nombres con la tabla `rol`).
- El backend debe bloquear la cuenta tras 3 intentos fallidos y devolver un `message` claro.
- Idealmente paginar en servidor las listas grandes (productos, kardex, documentos).
