import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config/env.js';
import { assertDatabaseConnection, pool } from './db/pool.js';
import { authRouter } from './routes/auth.js';
import { panelRouter } from './routes/panel.js';
import { errorHandler, HttpError } from './utils/errors.js';
import { catalogRoutes } from './routes/catalogs.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.corsOrigin.split(',').map((origin) => origin.trim()), credentials: false }));
app.use(express.json({ limit: `${config.maxUploadMb}mb` }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.get('/api/health', (_request, response) => response.json({ data: { estado: 'ok', servicio: 'SIGEM-Pyme API' } }));
app.use('/api/auth', authRouter);
app.use('/api/panel', panelRouter);
for (const { path, router } of catalogRoutes) app.use(`/api${path}`, router);
app.use((_request, _response, next) => {
  next(new HttpError(404, 'NO_ENCONTRADO', 'No se encontró el recurso solicitado.'));
});
app.use(errorHandler);

try {
  await assertDatabaseConnection();
  app.listen(config.port, () => {
    console.log(`SIGEM-Pyme API disponible en http://localhost:${config.port}`);
  });
} catch (error) {
  console.error('No se pudo iniciar SIGEM-Pyme API. Verifica server/.env y que MySQL esté disponible.', error.message);
  await pool.end();
  process.exitCode = 1;
}
