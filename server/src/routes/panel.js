import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authRequired, requirePermiso } from '../middlewares/auth.js';

export const panelRouter = Router();

panelRouter.get('/', authRequired, requirePermiso('reportes', 'ver'), async (request, response, next) => {
  try {
    const empresaId = request.auth.empresa_id;
    const [[sales]] = await pool.execute(
      `SELECT COALESCE(SUM(total_neto), 0) AS ventas,
              COALESCE(SUM(total_neto - costo_total), 0) AS margen
         FROM v_margen_venta
        WHERE empresa_id = ? AND fecha = CURDATE()`,
      [empresaId],
    );
    const [[receivable]] = await pool.execute(
      `SELECT COALESCE(SUM(saldo), 0) AS saldo
         FROM cuenta_por_cobrar
        WHERE empresa_id = ? AND estado IN ('PENDIENTE', 'PARCIAL') AND fecha_vencimiento < CURDATE()`,
      [empresaId],
    );
    const [[payable]] = await pool.execute(
      `SELECT COALESCE(SUM(saldo), 0) AS saldo
         FROM cuenta_por_pagar
        WHERE empresa_id = ? AND estado IN ('PENDIENTE', 'PARCIAL')
          AND fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      [empresaId],
    );
    const [week] = await pool.execute(
      `SELECT fecha, SUM(total_neto) AS ventas
         FROM v_margen_venta
        WHERE empresa_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY fecha ORDER BY fecha`,
      [empresaId],
    );
    const [alerts] = await pool.execute(
      `SELECT id, tipo, mensaje, fecha_limite, creada_en
         FROM alerta WHERE empresa_id = ? AND leida = 0
        ORDER BY fecha_limite IS NULL, fecha_limite, creada_en DESC LIMIT 8`,
      [empresaId],
    );
    return response.json({
      data: { ventas: sales.ventas, margen: sales.margen, porCobrarVencido: receivable.saldo, porPagarSemana: payable.saldo, semana: week, alertas: alerts },
    });
  } catch (error) {
    return next(error);
  }
});
