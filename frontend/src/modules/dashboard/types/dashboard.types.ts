export interface DashboardData {
  ventasHoy: number;
  margenMes: number;
  porCobrar: number;
  porCobrarVencido: number;
  comprasMes: number;
  porPagar: number;
  bajoMinimo: number;
  sobrestock: number;
  rcvConciliados: number;
  rcvTotal: number;
  ventasSemana: { dia: string; total: number }[];
}
