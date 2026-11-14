export class HttpError extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof HttpError) {
    return response.status(error.status).json({
      error: { codigo: error.codigo, mensaje: error.message, ...(error.detalles ? { detalles: error.detalles } : {}) },
    });
  }
  if (error?.name === 'ZodError') {
    return response.status(400).json({
      error: { codigo: 'VALIDACION', mensaje: 'Revisa los datos ingresados.', detalles: error.issues },
    });
  }
  if (error?.code === 'ER_DUP_ENTRY') {
    return response.status(409).json({ error: { codigo: 'DUPLICADO', mensaje: 'Ya existe un registro con esos datos.' } });
  }
  console.error('Error no controlado en API:', error);
  return response.status(500).json({
    error: {
      codigo: 'ERROR_INTERNO',
      mensaje: process.env.NODE_ENV === 'production' ? 'Ocurrió un error interno. Intenta nuevamente.' : error.message,
    },
  });
}
