# SIGEM-Pyme

```
sigem-pyme/
├── frontend/   React + TypeScript + Vite + Bootstrap   (este equipo)
├── backend/    Node.js + Express + MySQL                (equipo backend)
└── docs/       CONTRATO_API.md: endpoints que el frontend espera
```

## Levantar el frontend (VS Code)
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
Abre la carpeta `sigem-pyme` en VS Code. Extensiones recomendadas: ESLint, Prettier, ES7+ React Snippets.

El frontend arranca con **datos simulados** (`VITE_USE_MOCK=true`). Entra con cualquiera de los 5 roles (clave `demo1234`).
