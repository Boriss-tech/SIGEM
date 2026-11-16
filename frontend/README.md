# SIGEM-Pyme · Frontend

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm test` | Pruebas con Vitest |

## Estructura
```
src/
├── components/ui/        DataTable, StatusBadge, KpiCard, PageHeader, ReadOnlyNotice
├── components/layout/    MainLayout, Sidebar, Topbar
├── context/              AuthContext (sesión y permisos), ToastContext (avisos)
├── hooks/                useDebounce
├── router/               AppRouter, ProtectedRoute, navItems (menú + inicio por rol)
├── services/             api.ts (Axios) y mock/db.ts (datos simulados)
├── utils/                formatCLP, formatDate, validators (RUT), downloadBlob
└── modules/<modulo>/     components/ pages/ services/ hooks/ types/
    auth · dashboard · sales · inventory · purchases · documents · alerts · reports · admin
```
Cada módulo se corresponde con un área del backend. Los `types/` son el contrato de datos.

## Roles y permisos
El login devuelve `permisos: ["ventas:ver", "ventas:crear", ...]` (formato `modulo:accion`, igual que la tabla `permiso`).
- `ProtectedRoute permiso="..."` protege rutas; `can('ventas:crear')` oculta botones.
- Es solo experiencia de usuario: **el backend debe validar cada petición**.
- La matriz de permisos por rol en `services/mock/db.ts` es una propuesta a validar.

## Conectar el backend (para el equipo backend)
1. En `.env`: `VITE_USE_MOCK=false` y `VITE_API_URL=http://localhost:3000/api/v1`.
2. Implementar los endpoints de `docs/CONTRATO_API.md` devolviendo JSON con la forma de los `types/`.
3. Habilitar CORS para `http://localhost:5173`.
4. Borrar `src/services/mock/` cuando ya no se use.

Cada servicio usa `request(mock, real)`: no hay que tocar ninguna pantalla.
Si el backend responde 401, el frontend cierra la sesión automáticamente.
Los errores se muestran con el campo `message` de la respuesta (`{ "message": "..." }`).
