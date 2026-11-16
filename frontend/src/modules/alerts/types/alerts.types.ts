export type TipoAlerta =
  | 'STOCK_MINIMO' | 'SOBRESTOCK' | 'VENCIMIENTO' | 'PLAZO_TRIBUTARIO' | 'DOCUMENTO_PENDIENTE' | 'CUENTA_VENCIDA';
export interface Alerta { id: number; tipo: TipoAlerta; mensaje: string; fechaLimite?: string; leida: boolean }
