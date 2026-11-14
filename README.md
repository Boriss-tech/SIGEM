# SIGEM-Pyme

Prototipo web para la gestión de compras, ventas, inventario y documentación tributaria de Minimarket Don Pepe. SIGEM-Pyme **no emite documentos tributarios ni se conecta al SII**.

## Requisitos

- Node.js 22 o superior
- MySQL 8
- npm

## Preparar el entorno en Windows

Desde PowerShell, en la carpeta del proyecto (ejecuta la copia solo la primera vez, para no sobrescribir tu configuración):

```powershell
if (!(Test-Path server\.env)) { Copy-Item server\.env.example server\.env }
if (!(Test-Path client\.env)) { Copy-Item client\.env.example client\.env }
npm.cmd install
```

Completa `server\.env` con tus credenciales locales de MySQL y una clave JWT propia. Genera una clave con:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

No uses las credenciales ficticias del archivo `.env.example` en producción. Los archivos `.env` se excluyen de Git.

## Base de datos

Crea la base y un usuario de aplicación en MySQL 8 (usa en `server\.env` la misma contraseña que configures para `sigem_user`):

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sigem_pyme CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'sigem_user'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE'; GRANT ALL PRIVILEGES ON sigem_pyme.* TO 'sigem_user'@'localhost'"
& $env:ComSpec /c 'mysql -u root -p sigem_pyme < server\db\schema.sql'
npm.cmd run db:seed
```

Reemplaza `CAMBIA_ESTA_CLAVE` por una clave local y guarda la misma en `DB_PASSWORD`. El seed exige que definas `SEED_DEFAULT_PASSWORD` (mínimo 12 caracteres) y crea los cinco usuarios demo con contraseña hasheada. Las cuentas disponibles son `admin@sigem.cl`, `ventas@sigem.cl`, `bodega@sigem.cl`, `administrativo@sigem.cl` y `contador@sigem.cl`.

## Desarrollo

```powershell
npm.cmd run dev
```

- Cliente: <http://localhost:5173>
- API: <http://localhost:4000/api/health>

La API no inicia si faltan variables requeridas o si `JWT_SECRET` tiene menos de 32 caracteres.

## Estructura

- `client/`: React, TypeScript, Vite, Bootstrap.
- `server/`: Express, MySQL, autenticación JWT y autorización por permisos.
- `server/db/`: esquema inicial y seed SQL.

## Respaldo y restauración

Realiza respaldos diarios fuera del servidor de aplicación y prueba la restauración periódicamente. Ejemplo:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\sigem-backups"
& $env:ComSpec /c 'mysqldump -u sigem_user -p sigem_pyme > "%USERPROFILE%\sigem-backups\backup-sigem.sql"'
& $env:ComSpec /c 'mysql -u sigem_user -p sigem_pyme < "%USERPROFILE%\sigem-backups\backup-sigem.sql"'
```

Guarda respaldos cifrados y fuera de este repositorio. Los ambientes de prueba pueden apagarse fuera del horario laboral para controlar costos.

## Alcance actual

La primera entrega establece el monorepo, las 36 tablas y 4 vistas, autenticación, permisos, panel y pantallas con listados, altas y bajas lógicas para productos, proveedores y clientes (la API también admite edición). Los flujos transaccionales de ventas/compras, importadores XML/RCV, conciliación y administración de usuarios se completan en las siguientes fases. Las pantallas no disponibles se identifican como próximas etapas; no se simula la persistencia.
