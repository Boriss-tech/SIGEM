# PROMPT MAESTRO: Prototipo funcional SIGEM-Pyme (React + Vite + Node + Bootstrap)

> Pega este documento completo en tu asistente de VSCode (Claude Code, Copilot Chat, etc.) dentro de una carpeta vacía. Si el asistente tiene límite de contexto, entrégalo por bloques en el orden de las secciones, y al terminar cada fase pide que lo verifique antes de seguir.

---

## 0. ROL Y OBJETIVO

Actúa como un desarrollador full-stack senior. Vas a construir, dentro de esta carpeta, un **prototipo funcional** de **SIGEM-Pyme**: una plataforma web a medida para la gestión integrada de **compras, ventas, inventario y documentación tributaria** en pequeñas empresas, con un **minimarket de barrio** como caso de aplicación (“Minimarket Don Pepe”).

Contexto académico: Proyecto de Especialidad Profesional PEV-801. Equipo: Francisco Espindola, Boris Miranda, Franco Silva y Alfonso Sánchez.

Reglas de trabajo:
1. Construye por fases (sección 12). Al terminar cada fase, ejecuta el proyecto, corrige errores y resume qué quedó funcionando.
2. Todo el texto visible para el usuario debe estar **en español de Chile**.
3. Código en TypeScript en el frontend; en el backend puedes usar TypeScript o JavaScript moderno (ESM), pero sé consistente.
4. No inventes funcionalidades fuera del alcance (sección 2.3). Lo marcado como “propuesto” debe validarse con el dueño del minimarket.
5. Nunca escribas secretos reales en el código. Todo secreto va en `.env`.

---

## 1. STACK Y ESTRUCTURA

### 1.1 Stack obligatorio (RNF-24)
- **Frontend:** React 18 + TypeScript + **Vite**, **Bootstrap 5** (con `react-bootstrap`), React Router, TanStack Query, React Hook Form + Zod.
- **Backend:** Node.js + Express (arquitectura de tres capas: rutas/controladores → servicios → acceso a datos).
- **Base de datos:** **MySQL 8 (InnoDB)** con `mysql2` (consultas parametrizadas; sin ORM obligatorio).
- **Auth:** JWT + `bcrypt` (o `argon2`) para hash de contraseñas.
- **Seguridad:** `helmet`, `cors` configurado por variable de entorno, `express-rate-limit` en login, `zod` para validar entrada.
- **Archivos:** `multer` (carga en memoria) y `fast-xml-parser` para XML de DTE, `papaparse` para CSV del RCV.
- **Gráficos:** `recharts`. **Exportación:** `xlsx` (SheetJS) para Excel/CSV.
- **Pruebas:** `vitest` (frontend) y `vitest` o `jest` + `supertest` (backend) sobre la lógica de negocio.
- **Despliegue objetivo (no implementar ahora, solo dejar listo):** Vercel (frontend), Render (backend), Aiven (MySQL) (RNF-25).

### 1.2 Estructura de carpetas (monorepo)
```
sigem-pyme/
├─ .gitignore
├─ README.md
├─ package.json                 (scripts raíz con "concurrently": dev, build, test)
├─ client/                      (React + Vite + TS)
│  ├─ .env.example
│  ├─ index.html
│  └─ src/
│     ├─ main.tsx, App.tsx
│     ├─ api/                   (cliente HTTP con axios/fetch + interceptor de token)
│     ├─ auth/                  (AuthContext, ProtectedRoute, RoleGuard, useAuth)
│     ├─ components/            (DataTable, StatusBadge, MoneyInput, QuantityInput, RutInput,
│     │                          ProductSearch, FileDropzone, ConfirmDialog, AlertBell, Layout, Sidebar)
│     ├─ pages/                 (Login, Panel, VentaRapida, Inventario, Compras, Documentos,
│     │                          Conciliacion, CuentasPorCobrar, CuentasPorPagar, Terceros,
│     │                          Usuarios, Bitacora, Parametros, Reportes, NoAutorizado, NoEncontrado)
│     ├─ utils/                 (formato CLP, validación y formato de RUT, fechas)
│     └─ styles/                (theme.css con variables y overrides de Bootstrap)
└─ server/                      (Node + Express)
   ├─ .env.example
   ├─ package.json
   ├─ db/
   │  ├─ schema.sql             (las 36 tablas + 4 vistas, ver sección 6)
   │  └─ seed.sql / seed.js     (roles, permisos, rol_permiso, tipos de documento, empresa demo,
   │                             usuarios demo, productos, etc.)
   └─ src/
      ├─ index.js               (arranque)
      ├─ config/                (lectura y validación de variables de entorno)
      ├─ middlewares/           (auth, requirePermiso, errorHandler, validate, rateLimit)
      ├─ routes/ controllers/ services/ repositories/
      └─ utils/                 (rut, jwt, bitacora, transacciones)
```

---

## 2. REQUERIMIENTOS (fuente: documento “Requerimientos funcionales y no funcionales”)

Prioridad con **MoSCoW**. Todo **Must** es obligatorio en el prototipo; los **Should** se implementan si el tiempo lo permite (o como pantalla mínima); los **Could** quedan opcionales.

### 2.1 Requerimientos funcionales

**Seguridad y administración**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | Iniciar y cerrar sesión con usuario y contraseña. | Must |
| RF-02 | El administrador crea, edita y desactiva usuarios y les asigna rol (administrador, ventas, bodega, administrativo, contador). | Must |
| RF-03 | El acceso a módulos y acciones se restringe según el rol. | Must |
| RF-04 | Bitácora de auditoría de operaciones críticas (quién, qué, cuándo). | Must |

**Compras y proveedores**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-05 | Gestión de proveedores (RUT, razón social, contacto, condiciones de pago). | Must |
| RF-06 | Órdenes de compra con productos, cantidades y costos. | Must |
| RF-07 | Recepción de mercadería contra la orden de compra, validando cantidades y actualizando el stock automáticamente. | Must |
| RF-08 | Cuentas por pagar y pagos a proveedores. | Should |

**Inventario y bodegas**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-09 | Gestión de productos (código, categoría, unidad, costo, precio, stock mínimo, fecha de vencimiento). | Must |
| RF-10 | Gestión de bodegas y traspasos entre ellas. | Should |
| RF-11 | Registro trazable de todos los movimientos de inventario (entradas, salidas, ajustes) con kardex consultable. | Must |
| RF-12 | Ajustes de inventario a partir de conteos físicos asistidos, mostrando diferencias. | Should |
| RF-13 | Alertas automáticas de quiebre de stock, sobrestock y productos por vencer. | Should |

**Ventas y clientes**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-14 | Gestión de clientes. | Must |
| RF-15 | Registro de ventas que descuenta stock automáticamente. | Must |
| RF-16 | Cotizaciones con conversión a venta. | Should |
| RF-17 | Cuentas por cobrar y cobros. | Should |
| RF-18 | Asociar cada venta con la referencia de su documento tributario (emitido fuera del sistema). | Must |

**Documentos tributarios y RCV (solo importa y administra, NO emite)**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-19 | Importación de archivos XML de DTE. | Must |
| RF-20 | Importación del Registro de Compras y Ventas (RCV) exportado desde el SII. | Must |
| RF-21 | Validación de lo importado (formato, folio duplicado, RUT válido) con reporte de errores. | Must |
| RF-22 | Conciliación entre RCV y documentos registrados, mostrando diferencias. | Must |
| RF-23 | Repositorio documental con búsqueda y filtros por tipo, fecha, proveedor y folio, y descarga del respaldo. | Must |
| RF-24 | Vinculación automática de un DTE importado con su proveedor y compra. | Should |
| RF-25 | Alertas de plazos tributarios y documentos pendientes (cierre mensual). | Should |
| RF-26 | Exportación a formatos contables (CSV/Excel) para el contador. | Should |

**Panel, reportes y parametrización**
| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-27 | Panel con ventas, compras, stock, márgenes y cuentas por cobrar/pagar en tiempo real. | Must |
| RF-28 | Reportes exportables (Excel/PDF) de ventas, compras e inventario. | Should |
| RF-29 | Parámetros configurables por cliente (datos de empresa, umbrales de alertas, campos adicionales). | Could |

### 2.2 Requerimientos no funcionales

**Calidad (ISO/IEC 25010)**
- RNF-01: ≥ 80% de documentos de compra y venta se registran sin digitación duplicada (precargar datos desde XML/orden de compra).
- RNF-02 *(propuesto)*: operaciones habituales responden en ≤ 3 s.
- RNF-03 *(propuesto)*: importar un XML o RCV típico en < 1 minuto.
- RNF-04: puntaje SUS ≥ 70.
- RNF-05: interfaz en español, simple y **responsiva** (computador, tablet y celular).
- RNF-06: accesibilidad **WCAG 2.1 AA** (contraste 4.5:1, foco visible, teclado, estados que no dependan solo del color).
- RNF-07: respaldo diario de la BD con copia externa y restauración probada (documentar en README).
- RNF-08 *(propuesto)*: disponibilidad ≥ 99% en horario laboral.
- RNF-09: arquitectura cliente-servidor de tres capas, modular y parametrizable.
- RNF-10: cobertura de pruebas automatizadas ≥ 60% en lógica de negocio.
- RNF-11: Git, estrategia de ramas, revisión por pares, documentación técnica básica.
- RNF-12: cero defectos críticos abiertos en la validación.

**Seguridad**
- RNF-13: toda comunicación por HTTPS (en producción).
- RNF-14: contraseñas con hash seguro, nunca en texto plano.
- RNF-15: autenticación **y** autorización en cada endpoint de la API REST.
- RNF-16: validar entrada en cliente y servidor (prevención de inyección SQL y XSS).
- RNF-17: credenciales y claves por **variables de entorno**, fuera del código.
- RNF-18: cifrado de información sensible en reposo.
- RNF-19: 100% de operaciones críticas en bitácora y 100% de usuarios con permisos por rol.

**Cumplimiento legal**
- RNF-20: alineado con Ley 19.628 modificada por Ley 21.719: datos personales mínimos, trazabilidad de acceso, capacidad de corregir o eliminar datos.
- RNF-21: formatos de importación compatibles con normas del SII (DTE y RCV), con **importador modular** que absorba cambios de formato.
- RNF-22: términos de uso, política de privacidad y licencia de uso (Ley 17.336) — incluir páginas estáticas simples.

**Restricciones**
- RNF-23: 8 semanas / 384 horas / tres sprints Scrum.
- RNF-24: stack React + TypeScript, Node + Express, MySQL.
- RNF-25: despliegue Vercel + Render + Aiven, con ambientes local y de pruebas separados.
- RNF-26: presupuesto ~$1,25 millones (usar solo planes gratuitos).
- RNF-27: **multiempresa a nivel de datos**: `empresa_id` en casi todas las tablas; el `empresa_id` viaja en el token de sesión y **todas las consultas lo filtran**. No se construye selector de empresa en el front por ahora.
- RNF-28: ambientes de prueba apagados fuera de horario (documentar).

### 2.3 Fuera de alcance (Won’t, en esta etapa)
- **Emisión** de documentos tributarios electrónicos.
- Extracción de datos de facturas PDF con IA, detección de anomalías y sugerencias de reposición.
- Aplicación móvil nativa (solo web responsiva).
- Pasarelas de pago e integración directa con el SII.

---

## 3. AUTENTICACIÓN, ROLES Y VISTAS POR ROL (obligatorio)

### 3.1 Login
- Pantalla `/login` con correo y contraseña, mensajes de error claros y sin revelar si el correo existe (“Correo o contraseña incorrectos”).
- Backend `POST /api/auth/login`: valida con Zod, busca por `(empresa_id, email)`, compara hash, controla `intentos_fallidos` y `bloqueado_hasta` (bloquear 15 min tras 5 intentos fallidos), actualiza `ultimo_login`, registra en `bitacora_auditoria` (LOGIN, incluso fallidos con `usuario_id` nulo) y devuelve un JWT firmado con `JWT_SECRET` que incluya `sub`, `empresa_id`, `rol` y la lista de permisos.
- `POST /api/auth/logout` (el cliente descarta el token; registrar en bitácora) y `GET /api/auth/me`.
- Token con expiración configurable (`JWT_EXPIRES_IN`, ej. `8h`). Guardar en memoria + `sessionStorage` (o cookie httpOnly si prefieres) y manejar 401 redirigiendo a `/login`.
- Middleware `authRequired` (verifica JWT) y `requirePermiso(modulo, accion)` (consulta los permisos del rol). **Aplicar ambos en cada endpoint** (RNF-15). Filtrar siempre por `empresa_id` del token.
- Rate limit en `/api/auth/login`.
- En el cliente: `AuthContext`, `ProtectedRoute` (exige sesión) y `RoleGuard` (exige permiso). Si el rol no tiene permiso: página “No autorizada” (403). Los botones/menús sin permiso **se ocultan** (no se muestran deshabilitados). El front oculta, pero **el backend es quien valida**.

### 3.2 Roles y permisos
Cinco roles (tabla `rol`): `ADMIN` Administrador, `ADMINISTRATIVO`, `BODEGA`, `VENTAS`, `CONTADOR`.
Permisos = 7 módulos × 4 acciones = **28 permisos**: módulos `usuarios, compras, inventario, ventas, documentos, reportes, parametros`; acciones `ver, crear, editar, eliminar`.

Matriz inicial propuesta para el `seed` (V=ver, C=crear, E=editar, X=eliminar):

| Módulo | ADMIN | ADMINISTRATIVO | BODEGA | VENTAS | CONTADOR |
|---|---|---|---|---|---|
| usuarios | V C E X | — | — | — | — |
| compras | V C E X | V C E | V (ver órdenes, recibir) C* | — | V |
| inventario | V C E X | V | V C E | V | V |
| ventas | V C E X | V | — | V C E | V |
| documentos | V C E X | V C E | — | V | V C E |
| reportes | V C E X | V | V | V | V C |
| parametros | V C E X | V | — | — | — |

\* Bodega puede registrar recepciones y conteos físicos (acciones de inventario/compras acotadas). Deja la matriz completamente editable desde la pantalla de administración.

### 3.3 Vistas por rol (menú lateral filtrado + pantalla de inicio)
| Rol | Pantalla de inicio | Módulos visibles |
|---|---|---|
| **Administrador** | Panel completo + alertas | Todo: Panel, Venta rápida, Inventario, Compras, Documentos, Conciliación RCV, Cuentas por cobrar/pagar, Clientes, Proveedores, Reportes, Usuarios y permisos, Bitácora, Parámetros |
| **Ventas** | Venta rápida | Panel (resumido), Venta rápida, Cotizaciones, Clientes, Cuentas por cobrar |
| **Bodega** | Recepciones y stock | Panel (stock y alertas de inventario), Inventario (productos, kardex, lotes, traspasos, conteo físico), Recepción de mercadería |
| **Administrativo** | Compras | Compras, Proveedores, Documentos, Cuentas por pagar, Reportes |
| **Contador** | Conciliación RCV | Panel (resumen tributario), Conciliación RCV, Repositorio documental, Exportaciones (CSV/Excel) |

El **Panel** muestra tarjetas distintas según el rol (por ejemplo, Ventas ve ventas del día y cuentas por cobrar; Bodega ve stock bajo y vencimientos; Contador ve estado de conciliación del período).

### 3.4 Usuarios de prueba (seed)
Crear una empresa demo y un usuario por rol (`admin@sigem.cl`, `ventas@sigem.cl`, `bodega@sigem.cl`, `administrativo@sigem.cl`, `contador@sigem.cl`). La contraseña inicial **se lee de `SEED_DEFAULT_PASSWORD` en el `.env`** (no escribirla en el código ni en el README); el script de seed la hashea con bcrypt. En la pantalla de login (solo si `VITE_SHOW_DEMO_USERS=true`) puede haber un acceso rápido para el demo.

---

## 4. ARCHIVOS DE CONFIGURACIÓN (crear primero)

### 4.1 `.gitignore` (raíz del repo) — debe incluir como mínimo:
```gitignore
# Variables de entorno y secretos (NUNCA subir)
.env
.env.*
!.env.example
**/.env
**/.env.*
!**/.env.example
*.pem
*.key
*.crt
*.p12
*.pfx
secrets/
credentials*.json
service-account*.json

# Dependencias y builds
node_modules/
dist/
build/
.vite/
coverage/
*.tsbuildinfo

# Logs y temporales
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.cache/
tmp/
temp/

# Base de datos local, respaldos y archivos cargados
*.sqlite
*.sqlite3
*.db
*.sql.bak
backups/
dumps/
uploads/

# Editor y sistema operativo
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
.DS_Store
Thumbs.db

# Despliegue
.vercel/
.render/
```
No incluyas en el repositorio ningún archivo real de datos de clientes, XML ni RCV reales (usar solo archivos de ejemplo ficticios en `server/samples/`).

### 4.2 `server/.env.example` (versionado, con valores ficticios) y `server/.env` (real, ignorado)
```env
# ===== Aplicación =====
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

# ===== Base de datos MySQL =====
DB_HOST=localhost
DB_PORT=3306
DB_USER=sigem_user
DB_PASSWORD=cambia_esta_clave
DB_NAME=sigem_pyme
DB_SSL=false

# ===== Autenticación =====
JWT_SECRET=genera_una_cadena_larga_y_aleatoria_de_64_caracteres_minimo
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_MINUTES=15

# ===== Seed (solo desarrollo) =====
SEED_DEFAULT_PASSWORD=Cambiar.Esto.123
SEED_EMPRESA_RUT=76.123.456-7
SEED_EMPRESA_NOMBRE=Minimarket Don Pepe

# ===== Importación =====
MAX_UPLOAD_MB=10

# ===== Cifrado en reposo (RNF-18, campos sensibles) =====
DATA_ENCRYPTION_KEY=clave_de_32_bytes_en_base64
```

### 4.3 `client/.env.example` (y `client/.env` real, ignorado)
```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=SIGEM-Pyme
VITE_SHOW_DEMO_USERS=true
```

Requisitos:
- El servidor **debe fallar al iniciar** con un mensaje claro si falta una variable obligatoria (`JWT_SECRET`, `DB_*`) o si `JWT_SECRET` tiene menos de 32 caracteres.
- Solo las variables con prefijo `VITE_` llegan al navegador: **nunca** poner secretos ahí.
- Genera los `.env` locales a partir de los `.example` y recuérdame completarlos.
- En el `README.md` explica cómo copiar `.env.example` → `.env` y cómo generar un `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

---

## 5. DISEÑO Y UI (basado en el prototipo “SIGEM-Pyme: prototipo”)

Usa **Bootstrap 5** (`bootstrap`, `react-bootstrap`, `bootstrap-icons`) como base de componentes y grilla, y **personaliza** con `styles/theme.css` sobreescribiendo variables de Bootstrap (`--bs-primary`, etc.) para que se vea como el prototipo y no como Bootstrap por defecto.

**Identidad visual del prototipo**
- Tipografía: **Figtree** (Google Fonts) con fallback `system-ui`.
- Paleta (modo claro): fondo `#f3f6f7`, superficie `#ffffff`, texto `#14262b`, texto atenuado `#5a6e74`, borde `#dbe4e6`, **menú lateral `#0f3d44`** (texto `#d6ecee`), **acento `#0b7d83`**.
- Estados (siempre con **ícono + texto + color**): OK verde `#1b7a43` sobre `#e0f3e7`; Advertencia ámbar `#8a5a00` sobre `#fdf0cf`; Error rojo `#a8281f` sobre `#fbe3e0`; Info azul `#1d5aa6` sobre `#e1ecfa`.
- **Modo oscuro** automático con `prefers-color-scheme` (fondo `#0d1a1d`, superficie `#142428`, acento `#3fc1c7`, menú `#081f23`).
- Tarjetas con borde fino y radio ~12 px; tablas con números alineados a la derecha y `font-variant-numeric: tabular-nums`; montos en CLP (`$1.234.567`).
- Layout: **menú lateral fijo** en escritorio; en pantallas ≤ 860 px el menú pasa a **barra inferior** (con safe-area) y el contenido tiene padding inferior.
- Foco visible (`outline: 3px solid var(--acc)`), navegación por teclado, `aria-label` en botones de ícono, `aria-current="page"` en el menú, `role="status"` en toasts, `role="img"` con descripción en gráficos. Respetar `prefers-reduced-motion`.
- Mensajes: voz activa, frases en minúscula salvo la inicial, botones con verbo exacto (“Confirmar venta”, “Guardar cambios”), errores que explican cómo corregir, estados vacíos que invitan a actuar (“El carrito está vacío. Toca un producto para agregarlo.”).

**Pantallas del prototipo que debes replicar y ampliar con datos reales de la API**
1. **Panel:** 4 tarjetas KPI (ventas del día, margen del día, por cobrar vencido, por pagar esta semana), gráfico de barras de ventas de la semana (Recharts) y lista de alertas pendientes (stock bajo, vencimientos, cierre mensual). Datos desde las vistas `v_margen_venta`, `v_resumen_cuentas`, `v_stock_total` y la tabla `alerta`.
2. **Venta rápida (RF-15, RF-18):** buscador (nombre o código de barras, con foco automático) + grilla de productos a la izquierda; carrito a la derecha con +/− por línea, neto, IVA 19%, total, forma de pago (Contado/Crédito), medio de pago, cliente opcional (consumidor final sin RUT), campo “Folio del documento emitido fuera del sistema” con aviso “SIGEM-Pyme no emite documentos tributarios: solo guarda la referencia”. Si no hay stock, se avisa en la línea. Al confirmar: transacción en backend (ver sección 7). Atajos: F2 buscar, Enter agregar, F9 confirmar.
3. **Inventario (RF-09, RF-11, RF-13):** tabla con filtros (Todos / Bajo mínimo / Normal / Sobrestock), estado con chip, fecha de vencimiento; al seleccionar una fila, **ficha con pestañas**: Datos, Stock por bodega, **Kardex** (entradas verdes, salidas rojas, saldo posterior, enlace al documento de origen, no editable), Lotes.
4. **Conciliación RCV (RF-20 a RF-22):** zona de arrastrar y soltar (XML/RCV; avisa si el archivo ya fue cargado por su hash), tarjetas de conteo por estado (Conciliado, Pendiente, Diferencia de monto, Sin documento), filtros por estado y período, tabla con monto SII vs. monto sistema y diferencia resaltada, botón “Conciliar los que coinciden” y acción “Vincular manualmente” por fila. Tabla de errores de importación con descarga del reporte.
5. **Selector de rol del prototipo:** en el prototipo era un selector de demostración; en la versión real el rol **viene del login**. Puedes conservar un selector de “ver como” solo para el administrador si `VITE_SHOW_DEMO_USERS=true`.

**Pantallas adicionales** (en el orden de la sección 12): Compras (orden + recepción), Documentos (repositorio), Proveedores, Clientes, Cuentas por pagar/cobrar, Conteo físico, Traspasos, Cotizaciones, Reportes/Exportación, Usuarios y permisos (matriz módulo × acción con checkboxes), Bitácora (línea de tiempo filtrable por usuario/acción/entidad, con “antes y después” del JSON `detalle`), Parámetros de empresa.

**Componentes reutilizables a construir una sola vez:** `DataTable` (búsqueda, filtros, paginación, orden, exportar), `StatusBadge` (todos los ENUM de estado), `MoneyInput` (2 decimales), `QuantityInput` (3 decimales, productos pesables), `RutInput` (formato y dígito verificador en vivo), `ProductSearch`, `FileDropzone` (progreso y errores), `ConfirmDialog` (con campo “motivo” cuando corresponda), `AlertBell` (contador de no leídas), `Toast`.

---

## 6. BASE DE DATOS (fuente: “Diccionario de datos y relaciones”)

Base `sigem_pyme`, MySQL 8, InnoDB. **36 tablas y 4 vistas en 10 módulos.** Genera `server/db/schema.sql` con todas las tablas siguientes, y `seed` con datos de ejemplo.

### 6.1 Convenciones (respetarlas siempre)
- **PK / FK / UQ** como se indica. Casi todas las tablas llevan `empresa_id` (multiempresa, RNF-27); `tipo_documento`, `rol` y `permiso` son catálogos globales.
- **Montos:** `DECIMAL(14,2)`. **Cantidades:** `DECIMAL(12,3)` (productos pesables). **Estados:** `ENUM`.
- **Borrado lógico:** productos, clientes, proveedores y usuarios se **desactivan** con `activo`, no se eliminan.
- **Sin triggers:** la lógica de negocio (descontar stock, calcular saldos, conciliar) vive en el backend, **dentro de transacciones**.
- Fechas de registro `creado_en DATETIME DEFAULT CURRENT_TIMESTAMP`.

### 6.2 Tablas por módulo

**Empresa y parametrización**
- `empresa`: id PK; rut VARCHAR(12) UQ; razon_social VARCHAR(150); nombre_fantasia VARCHAR(150) NULL; giro VARCHAR(200); direccion, comuna, telefono, email; activa TINYINT(1); creado_en.
- `parametro_empresa`: id PK; empresa_id FK; clave VARCHAR(80); valor VARCHAR(255); descripcion VARCHAR(200). **UQ (empresa_id, clave)**. Ej.: `dias_alerta_vencimiento`.

**Seguridad**
- `rol`: id TINYINT PK; codigo VARCHAR(30) UQ (ADMIN, BODEGA…); nombre VARCHAR(60); descripcion VARCHAR(200).
- `permiso`: id SMALLINT PK; modulo VARCHAR(30); accion VARCHAR(20) (ver/crear/editar/eliminar). **UQ (modulo, accion)**. 28 filas iniciales.
- `rol_permiso`: PK compuesta (rol_id FK, permiso_id FK).
- `usuario`: id PK; empresa_id FK; rol_id FK; nombre VARCHAR(100); email VARCHAR(120); password_hash VARCHAR(255); activo; intentos_fallidos TINYINT; bloqueado_hasta DATETIME NULL; ultimo_login DATETIME NULL; creado_en. **UQ (empresa_id, email)**.
- `bitacora_auditoria`: id BIGINT PK; empresa_id FK; usuario_id FK **NULL**; accion VARCHAR(60) (LOGIN, CREAR, EDITAR, ANULAR, IMPORTAR, AJUSTAR_STOCK); entidad VARCHAR(60); entidad_id BIGINT; detalle **JSON** (antes/después); ip VARCHAR(45); fecha DATETIME. Índices (empresa_id, fecha) y (entidad, entidad_id). Sin FK hacia la entidad afectada.

**Terceros**
- `proveedor`: id PK; empresa_id FK; rut VARCHAR(12); razon_social; contacto_nombre, email, telefono, direccion; **dias_pago SMALLINT (0 = contado)**; activo; creado_en. **UQ (empresa_id, rut)**.
- `cliente`: id PK; empresa_id FK; **rut NULL** (consumidor final); razon_social; email, telefono, direccion; activo; creado_en. UQ (empresa_id, rut) (MySQL admite varios NULL).

**Inventario y bodegas**
- `categoria`: id PK; empresa_id FK; nombre VARCHAR(80); UQ (empresa_id, nombre).
- `producto`: id PK; empresa_id FK; categoria_id FK NULL; codigo VARCHAR(40); codigo_barras VARCHAR(40); nombre VARCHAR(150); descripcion VARCHAR(300); unidad_medida VARCHAR(15) (UN, KG, LT, CJ); costo_promedio, precio_venta DECIMAL(14,2); afecto_iva TINYINT; stock_minimo DECIMAL(12,3); stock_maximo DECIMAL(12,3) NULL; controla_vencimiento TINYINT; activo; creado_en. **UQ (empresa_id, codigo)**; CHECK costo, precio y stock_minimo ≥ 0; índices por codigo_barras y nombre.
- `bodega`: id PK; empresa_id FK; nombre VARCHAR(80) UQ por empresa; ubicacion VARCHAR(150); activa.
- `stock_bodega`: **PK compuesta (producto_id FK, bodega_id FK)**; cantidad DECIMAL(12,3) **CHECK ≥ 0**; actualizado_en (ON UPDATE). Saldo actual rápido; el historial está en `movimiento_inventario`.
- `lote`: id PK; producto_id FK; bodega_id FK; codigo_lote VARCHAR(40); fecha_vencimiento DATE (indexada); cantidad_actual DECIMAL(12,3) CHECK ≥ 0. **UQ (producto_id, bodega_id, codigo_lote)**. Solo para productos con `controla_vencimiento = 1`.

**Documentos tributarios (el sistema NO emite)**
- `tipo_documento`: **codigo SMALLINT PK (código oficial SII)**; nombre; afecto_iva. Datos iniciales: 30 factura, 33 factura electrónica, 34 factura exenta electrónica, 39 boleta electrónica, 41 boleta exenta, 46 factura de compra, 52 guía de despacho, 56 nota de débito, 61 nota de crédito. Global (sin empresa_id).
- `documento_tributario`: id BIGINT PK; empresa_id FK; origen ENUM(COMPRA, VENTA); tipo_documento FK; folio BIGINT; rut_emisor, rut_receptor VARCHAR(12); proveedor_id FK NULL; cliente_id FK NULL; fecha_emision DATE; monto_neto, monto_exento, monto_iva, monto_total DECIMAL(14,2); xml_contenido LONGTEXT (respaldo); estado ENUM(IMPORTADO, VINCULADO, ANULADO); importacion_id FK; creado_en. **UQ (empresa_id, tipo_documento, folio, rut_emisor)**; índices por fecha, proveedor y cliente.
- `documento_tributario_detalle`: id BIGINT PK; documento_id FK (**ON DELETE CASCADE**); linea SMALLINT; producto_id FK NULL; descripcion VARCHAR(200); cantidad DECIMAL(12,3); precio_unitario, monto_linea DECIMAL(14,2). UQ (documento_id, linea).

**Compras**
- `orden_compra`: id PK; empresa_id FK; numero INT (correlativo por empresa); proveedor_id FK; usuario_id FK; fecha DATE; estado ENUM(BORRADOR, EMITIDA, RECIBIDA_PARCIAL, RECIBIDA, ANULADA); total_neto, total_iva, total; observacion VARCHAR(300); creado_en. **UQ (empresa_id, numero)**.
- `orden_compra_detalle`: id BIGINT PK; orden_compra_id FK (CASCADE); producto_id FK; cantidad; **cantidad_recibida**; costo_unitario. UQ (orden_compra_id, producto_id); **CHECK cantidad > 0 y cantidad_recibida ≤ cantidad**.
- `recepcion_mercaderia`: id PK; empresa_id FK; orden_compra_id FK; bodega_id FK; usuario_id FK; documento_id FK NULL (factura o guía ya importada); fecha DATETIME; observacion.
- `recepcion_detalle`: id BIGINT PK; recepcion_id FK (CASCADE); producto_id FK; cantidad (> 0); costo_unitario; lote_id FK NULL.
- `cuenta_por_pagar`: id PK; empresa_id FK; proveedor_id FK; documento_id FK NULL; orden_compra_id FK NULL; fecha_emision, fecha_vencimiento DATE; monto_total, saldo; estado ENUM(PENDIENTE, PARCIAL, PAGADA, ANULADA). **CHECK 0 ≤ saldo ≤ monto_total**; índice (empresa_id, estado, fecha_vencimiento).
- `pago_proveedor`: id PK; cuenta_por_pagar_id FK; usuario_id FK; fecha DATE; monto (> 0); medio_pago ENUM(EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA, OTRO); referencia VARCHAR(80).

**Ventas**
- `venta`: id PK; empresa_id FK; numero INT; cliente_id FK NULL; usuario_id FK; bodega_id FK; documento_id FK NULL (DTE emitido externamente ya importado, RF-18); folio_externo VARCHAR(30) (manual mientras no se importa el XML); fecha DATETIME; forma_pago ENUM(CONTADO, CREDITO); medio_pago ENUM(EFECTIVO, TARJETA, TRANSFERENCIA, OTRO); estado ENUM(CONFIRMADA, ANULADA); total_neto, total_iva, total. UQ (empresa_id, numero); índice (empresa_id, fecha).
- `venta_detalle`: id BIGINT PK; venta_id FK (CASCADE); producto_id FK; cantidad (> 0); precio_unitario; descuento (por unidad); **costo_unitario (costo al momento de vender, para margen real)**; lote_id FK NULL.
- `cotizacion`: id PK; empresa_id FK; numero; cliente_id FK; usuario_id FK; fecha; vigencia_hasta DATE; estado ENUM(PENDIENTE, ACEPTADA, RECHAZADA, VENCIDA, CONVERTIDA); venta_id FK NULL; total. UQ (empresa_id, numero).
- `cotizacion_detalle`: id BIGINT PK; cotizacion_id FK (CASCADE); producto_id FK; cantidad (> 0); precio_unitario; descuento.
- `cuenta_por_cobrar`: id PK; empresa_id FK; cliente_id FK; venta_id FK; fecha_emision, fecha_vencimiento; monto_total, saldo; estado ENUM(PENDIENTE, PARCIAL, COBRADA, ANULADA). CHECK 0 ≤ saldo ≤ monto_total; índice (empresa_id, estado, fecha_vencimiento).
- `cobro`: id PK; cuenta_por_cobrar_id FK; usuario_id FK; fecha; monto (> 0); medio_pago ENUM(EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA, OTRO); referencia.

**Kardex y conteo físico**
- `movimiento_inventario` (**inmutable: nunca UPDATE ni DELETE**): id BIGINT PK; empresa_id FK; producto_id FK; bodega_id FK; lote_id FK NULL; tipo ENUM(ENTRADA_COMPRA, SALIDA_VENTA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, TRASPASO_ENTRADA, TRASPASO_SALIDA, DEVOLUCION_VENTA, DEVOLUCION_COMPRA); cantidad DECIMAL(12,3) **siempre positiva** (el tipo define si suma o resta; CHECK > 0); costo_unitario; **saldo_posterior**; referencia_tipo ENUM(RECEPCION, VENTA, CONTEO, TRASPASO, MANUAL); referencia_id BIGINT (lógica, sin FK); motivo VARCHAR(200) (obligatorio en ajustes manuales); usuario_id FK; fecha DATETIME. Índices (empresa_id, producto_id, fecha) y (referencia_tipo, referencia_id).
- `conteo_fisico`: id PK; empresa_id FK; bodega_id FK; usuario_id FK; fecha; estado ENUM(ABIERTO, CERRADO, AJUSTADO); observacion.
- `conteo_fisico_detalle`: id BIGINT PK; conteo_id FK (CASCADE); producto_id FK; cantidad_sistema; cantidad_contada; **diferencia = columna generada (cantidad_contada − cantidad_sistema)**. UQ (conteo_id, producto_id).

**Importación y RCV**
- `importacion_archivo`: id BIGINT PK; empresa_id FK; usuario_id FK; tipo ENUM(XML_DTE, RCV_COMPRAS, RCV_VENTAS); nombre_archivo; **hash_sha256 CHAR(64)**; periodo CHAR(7) AAAA-MM (NULL para XML); registros_total, registros_ok, registros_error; fecha. **UQ (empresa_id, hash_sha256)**.
- `importacion_error`: id BIGINT PK; importacion_id FK (CASCADE); linea; codigo_error VARCHAR(40) (FOLIO_DUPLICADO, RUT_INVALIDO, FORMATO…); mensaje VARCHAR(300).
- `rcv_registro`: id BIGINT PK; empresa_id FK; importacion_id FK; libro ENUM(COMPRA, VENTA); periodo CHAR(7); tipo_documento FK; folio; rut_contraparte; razon_social; fecha_documento; monto_neto, monto_exento, monto_iva, monto_total; documento_id FK NULL; estado_conciliacion ENUM(PENDIENTE, CONCILIADO, DIFERENCIA_MONTO, SIN_DOCUMENTO). **UQ (empresa_id, libro, tipo_documento, folio, rut_contraparte)**; índice (empresa_id, periodo, estado_conciliacion).

**Alertas**
- `alerta`: id BIGINT PK; empresa_id FK; tipo ENUM(STOCK_MINIMO, SOBRESTOCK, VENCIMIENTO, PLAZO_TRIBUTARIO, DOCUMENTO_PENDIENTE, CUENTA_VENCIDA); producto_id FK NULL; lote_id FK NULL; mensaje VARCHAR(250); fecha_limite DATE NULL; leida TINYINT; creada_en. Índice (empresa_id, leida, tipo). Un proceso programado del backend (`node-cron`, diario y al iniciar) las genera comparando umbrales (`stock_minimo`, `stock_maximo`, `parametro_empresa.dias_alerta_vencimiento`) y fechas, sin duplicar alertas ya existentes sin leer.

### 6.3 Vistas (alimentan panel y reportes, RF-27/RF-28)
- `v_stock_total`: stock total por producto (suma de bodegas) y situación `BAJO_MINIMO | NORMAL | SOBRESTOCK`. Usa `producto`, `stock_bodega`.
- `v_margen_venta`: venta neta, costo y margen por venta y por día, **solo ventas CONFIRMADAS**. Usa `venta`, `venta_detalle`.
- `v_resumen_cuentas`: cantidad de documentos, saldo pendiente y saldo vencido de cuentas por cobrar y por pagar.
- `v_conciliacion_rcv`: cantidad de registros y monto del RCV por período, libro y estado de conciliación.

---

## 7. LÓGICA DE NEGOCIO (siempre en transacción, en el backend)

**Flujo de compra y recepción**
1. Crear `orden_compra` + `orden_compra_detalle` para un proveedor.
2. Registrar `recepcion_mercaderia` + `recepcion_detalle` (validar que lo recibido no supere lo pendiente de la orden).
3. Por cada línea: sumar a `stock_bodega`, crear `movimiento_inventario` tipo `ENTRADA_COMPRA` (con `saldo_posterior`), actualizar `cantidad_recibida` y el estado de la orden (RECIBIDA_PARCIAL / RECIBIDA), recalcular `costo_promedio` del producto y, si el producto vence, crear o actualizar el `lote`.
4. Crear la `cuenta_por_pagar` (vencimiento = fecha + `proveedor.dias_pago`) y registrar cada abono en `pago_proveedor`, descontando del saldo y cambiando el estado (PENDIENTE → PARCIAL → PAGADA).

**Flujo de venta**
1. Registrar `venta` + `venta_detalle` (opcionalmente desde una `cotizacion`, que pasa a CONVERTIDA y guarda `venta_id`).
2. Por cada línea: validar stock suficiente, descontar de `stock_bodega` (usar `SELECT … FOR UPDATE`), crear `movimiento_inventario` tipo `SALIDA_VENTA` y guardar `costo_unitario` en `venta_detalle`. En productos con vencimiento descontar de lotes (primero el que vence antes, FEFO).
3. Si es a crédito, crear `cuenta_por_cobrar`; cada pago va en `cobro`.
4. Enlazar con el documento emitido externamente vía `documento_id` o `folio_externo`.
5. Anular una venta devuelve el stock con un movimiento `DEVOLUCION_VENTA` (no borra nada).

**Flujo de importación y conciliación**
1. Subir archivo → crear `importacion_archivo` (calcular SHA-256; **si el hash ya existe, rechazar**).
2. XML DTE → `documento_tributario` + `documento_tributario_detalle`; filas inválidas a `importacion_error` (validar formato, folio duplicado por UQ, RUT con dígito verificador). Intentar vincular proveedor por RUT y líneas con productos por coincidencia (RF-24).
3. RCV (CSV) → `rcv_registro`.
4. Conciliar comparando `rcv_registro` con `documento_tributario` por **tipo + folio + RUT**: marcar `CONCILIADO`, `DIFERENCIA_MONTO` o `SIN_DOCUMENTO`.
5. **Importador modular:** un parser por formato en `server/src/importers/` con interfaz común, para absorber cambios del SII (RNF-21). Incluir archivos de ejemplo ficticios en `server/samples/`.

**Flujo de inventario físico**
1. Abrir `conteo_fisico`, registrar cantidades en `conteo_fisico_detalle` (guardar `cantidad_sistema` al contar).
2. Cerrar → mostrar diferencias. Ajustar → por cada diferencia crear movimiento `AJUSTE_POSITIVO`/`AJUSTE_NEGATIVO` con motivo y actualizar `stock_bodega`; el conteo queda `AJUSTADO`.
3. Traspasos entre bodegas: dos movimientos `TRASPASO_SALIDA` / `TRASPASO_ENTRADA` en la misma transacción.

**Reglas de integridad (deben cumplirse y tener pruebas)**
- El stock nunca queda negativo (CHECK + validación previa con mensaje claro).
- No se importa dos veces el mismo documento ni el mismo archivo.
- Saldos de cuentas por cobrar/pagar nunca negativos ni mayores al monto original.
- Lo recibido en una orden nunca supera lo pedido.
- Todo movimiento de inventario queda trazado con usuario, fecha, motivo y saldo posterior, y **no se modifica ni se elimina**.
- Toda operación crítica (login, crear/editar/anular, importar, ajustar stock, cambios de permisos) escribe en `bitacora_auditoria` con `detalle` antes/después e IP.
- Cada consulta y escritura filtra por `empresa_id` del token.

---

## 8. API REST (resumen mínimo)

Prefijo `/api`. Todas las rutas (salvo login) usan `authRequired` + `requirePermiso(modulo, accion)`; respuestas JSON con errores `{ error: { codigo, mensaje, detalles? } }` y códigos HTTP correctos (400, 401, 403, 404, 409, 422).

- `auth`: login, logout, me.
- `usuarios`, `roles`, `permisos` (matriz editable), `bitacora` (GET con filtros y paginación).
- `proveedores`, `clientes`, `categorias`, `productos` (búsqueda por nombre/código/código de barras), `bodegas`.
- `inventario`: stock por bodega, `kardex/:productoId`, lotes, traspasos, conteos (abrir, registrar, cerrar, ajustar).
- `compras`: órdenes, recepciones, cuentas por pagar, pagos.
- `ventas`: ventas, anulación, cotizaciones (y conversión), cuentas por cobrar, cobros.
- `documentos`: importar XML, listar/buscar con filtros (tipo, fecha, proveedor, folio), descargar respaldo XML.
- `rcv`: importar RCV, listar, `conciliar`, vincular manual, errores de importación.
- `panel`: KPIs (usando las vistas), alertas (listar, marcar leídas).
- `reportes`: ventas, compras, inventario, conciliación → Excel/CSV (RF-26/RF-28).
- `parametros`: leer/actualizar por empresa.

Paginación estándar `?page=&pageSize=&q=&orden=`. Rendimiento objetivo ≤ 3 s (índices ya definidos).

---

## 9. SEGURIDAD (checklist obligatorio)

- Consultas **parametrizadas** siempre; nunca concatenar SQL (RNF-16).
- Validación con Zod en el servidor y en formularios del cliente; escapar/sanear salida para evitar XSS (no usar `dangerouslySetInnerHTML`).
- `helmet`, CORS restringido a `CORS_ORIGIN`, límite de tamaño de carga (`MAX_UPLOAD_MB`), validación de tipo de archivo (XML/CSV) y rechazo de XML con entidades externas (XXE).
- Contraseñas: bcrypt con `BCRYPT_ROUNDS`; política mínima de contraseña; bloqueo por intentos.
- Cifrado en reposo para datos sensibles (RNF-18): por ejemplo, cifrar con AES-256-GCM (clave `DATA_ENCRYPTION_KEY`) los campos de contacto de clientes (email/teléfono), y documentar el resto del cifrado a nivel de BD/hosting.
- Privacidad (Ley 21.719): datos personales mínimos, endpoints para **corregir** y **anonimizar/eliminar** datos de un cliente cuando no afecten el historial, y trazabilidad de acceso en bitácora.
- Nunca registrar contraseñas ni tokens en logs. Mensajes de error de producción sin stack trace.

---

## 10. PRUEBAS Y CALIDAD

- Pruebas automatizadas (meta ≥ 60% en lógica de negocio) para: login y bloqueo, `requirePermiso`, venta con descuento de stock, stock insuficiente, recepción parcial/total, ajuste por conteo, importación con folio duplicado y RUT inválido, hash de archivo repetido, conciliación (3 estados) y validación de RUT.
- Lint (ESLint) y formato (Prettier) configurados; scripts `npm run lint`, `npm test`.
- README con: requisitos, instalación, configuración de `.env`, creación de la BD (`schema.sql` + `seed`), cómo correr en desarrollo, usuarios demo por rol, estructura del proyecto, procedimiento de **respaldo y restauración** de la BD (RNF-07) y nota de ambientes apagados fuera de horario (RNF-28).
- Páginas estáticas: términos de uso, política de privacidad y licencia de uso (RNF-22).

---

## 11. DATOS DE DEMOSTRACIÓN (seed)

Empresa “Minimarket Don Pepe”, 5 usuarios (uno por rol), 2 bodegas (Sala de ventas y Bodega trasera), categorías (abarrotes, lácteos, bebidas, panadería), ~25 productos (incluir pan marraqueta en kg, leche, arroz, aceite, bebida, huevos, yogurt con lote y vencimiento cercano, fideos), 5 proveedores y 8 clientes (uno “Consumidor final” sin RUT), stock inicial con algunos productos bajo mínimo, 10 ventas de la última semana, 2 órdenes de compra (una pendiente, una recibida parcial), cuentas por cobrar/pagar con vencidas, un RCV de ejemplo (6–8 filas con casos: conciliado, pendiente, diferencia de monto, sin documento) y 3 XML de DTE ficticios. Todos los RUT de ejemplo deben ser válidos matemáticamente pero ficticios.

---

## 12. FASES DE ENTREGA (3 sprints)

**Fase 1: Base (Sprint 1)**
1. Estructura del monorepo, `.gitignore`, `.env.example` (cliente y servidor), `.env` locales, scripts raíz con `concurrently`.
2. `schema.sql` completo (36 tablas + 4 vistas) y `seed`.
3. Backend: configuración validada, conexión MySQL con pool, middlewares, **login/logout/me, JWT, RBAC por permisos, bitácora**.
4. Frontend: tema Bootstrap personalizado, `Layout` con menú lateral/barra inferior filtrado por rol, **Login**, `ProtectedRoute`, `RoleGuard`, página 403/404, Panel con datos básicos.
5. CRUD con borrado lógico: productos, categorías, proveedores, clientes, bodegas, usuarios (y matriz de permisos).

**Fase 2: Operación (Sprint 2)**
6. Venta rápida completa (transaccional, descuento de stock, kardex, folio externo, CxC).
7. Compras: orden, recepción contra orden (stock + kardex + lote + costo promedio) y cuentas por pagar con pagos.
8. Inventario: stock por bodega, kardex consultable, lotes.
9. Importación de XML DTE y RCV con validación, errores y hash anti-duplicado.

**Fase 3: Control y cierre (Sprint 3)**
10. Conciliación RCV (estados, vinculación manual, filtros) y repositorio documental con búsqueda y descarga.
11. Alertas (cron) y panel completo con gráficos y vistas SQL; conteo físico y traspasos; cotizaciones.
12. Reportes y exportación Excel/CSV; bitácora con vista de diferencias; parámetros por empresa (Could).
13. Pruebas, README, páginas legales, revisión de accesibilidad (WCAG AA) y responsividad.

---

## 13. CRITERIOS DE ACEPTACIÓN DEL PROTOTIPO

- [ ] `npm install` y `npm run dev` levantan cliente (5173) y servidor (4000) sin errores.
- [ ] `.gitignore` excluye `.env` y demás archivos sensibles; solo los `.env.example` están versionados.
- [ ] El login funciona con los 5 roles; cada rol ve solo su menú y su pantalla de inicio; la API devuelve 403 si se fuerza una ruta sin permiso.
- [ ] Una venta descuenta stock, genera movimiento de kardex y, si es a crédito, crea la cuenta por cobrar.
- [ ] Una recepción contra orden de compra suma stock, crea el kardex y no permite recibir más de lo pedido.
- [ ] Se puede importar un XML y un RCV de ejemplo, ver errores y conciliar con los 3 estados.
- [ ] Toda operación crítica aparece en la bitácora.
- [ ] La interfaz es responsiva (escritorio, tablet, celular), en español, con foco visible, estados con ícono + texto y modo oscuro.
- [ ] No existe emisión de DTE ni integración directa con el SII (fuera de alcance).

---

## 14. PUNTOS A VALIDAR CON EL DUEÑO DEL MINIMARKET (no bloquean el desarrollo)

- ¿Usará **lector de código de barras**? (optimizar teclado y escáner en venta rápida).
- ¿El uso diario se centra en la **venta rápida** o en compras y documentos?
- Multiempresa: por ahora **solo diseño de datos** (`empresa_id`), sin pantallas de gestión de empresas.
- Rendimiento y disponibilidad (RNF-02, 03, 08) son propuestos: 99% puede ser difícil con planes gratuitos.
- Conseguir **muestras reales** de XML y RCV del SII antes del Sprint 2 (suposición crítica del proyecto).

---

**Empieza ahora por la Fase 1, paso 1.** Antes de escribir código, muéstrame brevemente el árbol de carpetas que vas a crear y los comandos de instalación; luego avanza paso a paso y verifica que todo compile antes de pasar a la siguiente fase.
