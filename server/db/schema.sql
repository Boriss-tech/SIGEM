CREATE DATABASE IF NOT EXISTS sigem_pyme CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE sigem_pyme;

CREATE TABLE IF NOT EXISTS empresa (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(12) NOT NULL UNIQUE,
  razon_social VARCHAR(150) NOT NULL,
  nombre_fantasia VARCHAR(150),
  giro VARCHAR(200) NOT NULL DEFAULT '',
  direccion VARCHAR(200), comuna VARCHAR(100), telefono VARCHAR(30), email VARCHAR(120),
  activa TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parametro_empresa (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  clave VARCHAR(80) NOT NULL,
  valor VARCHAR(255) NOT NULL,
  descripcion VARCHAR(200),
  UNIQUE KEY uq_parametro_empresa (empresa_id, clave),
  CONSTRAINT fk_parametro_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rol (
  id TINYINT UNSIGNED PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(60) NOT NULL,
  descripcion VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permiso (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  modulo VARCHAR(30) NOT NULL,
  accion VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_permiso_modulo_accion (modulo, accion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id TINYINT UNSIGNED NOT NULL,
  permiso_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  CONSTRAINT fk_rol_permiso_rol FOREIGN KEY (rol_id) REFERENCES rol(id),
  CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) REFERENCES permiso(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  rol_id TINYINT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta DATETIME,
  ultimo_login DATETIME,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_empresa_email (empresa_id, email),
  CONSTRAINT fk_usuario_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bitacora_auditoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED,
  usuario_id BIGINT UNSIGNED,
  accion VARCHAR(60) NOT NULL,
  entidad VARCHAR(60) NOT NULL,
  entidad_id BIGINT UNSIGNED,
  detalle JSON,
  ip VARCHAR(45),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_bitacora_empresa_fecha (empresa_id, fecha),
  KEY ix_bitacora_entidad (entidad, entidad_id),
  CONSTRAINT fk_bitacora_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_bitacora_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedor (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  rut VARCHAR(12) NOT NULL,
  razon_social VARCHAR(150) NOT NULL,
  contacto_nombre VARCHAR(100), email VARCHAR(120), telefono VARCHAR(30), direccion VARCHAR(200),
  dias_pago SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_proveedor_empresa_rut (empresa_id, rut),
  CONSTRAINT fk_proveedor_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cliente (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  rut VARCHAR(12),
  razon_social VARCHAR(150) NOT NULL,
  email VARCHAR(120), telefono VARCHAR(30), direccion VARCHAR(200),
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cliente_empresa_rut (empresa_id, rut),
  CONSTRAINT fk_cliente_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_categoria_empresa_nombre (empresa_id, nombre),
  CONSTRAINT fk_categoria_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS producto (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  categoria_id BIGINT UNSIGNED,
  codigo VARCHAR(40) NOT NULL,
  codigo_barras VARCHAR(40),
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(300),
  unidad_medida VARCHAR(15) NOT NULL DEFAULT 'UN',
  costo_promedio DECIMAL(14,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(14,2) NOT NULL DEFAULT 0,
  afecto_iva TINYINT(1) NOT NULL DEFAULT 1,
  stock_minimo DECIMAL(12,3) NOT NULL DEFAULT 0,
  stock_maximo DECIMAL(12,3),
  controla_vencimiento TINYINT(1) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_producto_empresa_codigo (empresa_id, codigo),
  KEY ix_producto_codigo_barras (codigo_barras),
  KEY ix_producto_nombre (nombre),
  CONSTRAINT fk_producto_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id),
  CONSTRAINT chk_producto_precios CHECK (costo_promedio >= 0 AND precio_venta >= 0 AND stock_minimo >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bodega (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  ubicacion VARCHAR(150),
  activa TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_bodega_empresa_nombre (empresa_id, nombre),
  CONSTRAINT fk_bodega_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_bodega (
  producto_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL DEFAULT 0,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (producto_id, bodega_id),
  CONSTRAINT fk_stock_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_stock_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT chk_stock_no_negativo CHECK (cantidad >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lote (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  codigo_lote VARCHAR(40) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  cantidad_actual DECIMAL(12,3) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_lote_producto_bodega_codigo (producto_id, bodega_id, codigo_lote),
  KEY ix_lote_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_lote_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_lote_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT chk_lote_cantidad CHECK (cantidad_actual >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipo_documento (
  codigo SMALLINT UNSIGNED PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  afecto_iva TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS importacion_archivo (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('XML_DTE','RCV_COMPRAS','RCV_VENTAS') NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  hash_sha256 CHAR(64) NOT NULL,
  periodo CHAR(7),
  registros_total INT UNSIGNED NOT NULL DEFAULT 0,
  registros_ok INT UNSIGNED NOT NULL DEFAULT 0,
  registros_error INT UNSIGNED NOT NULL DEFAULT 0,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_importacion_empresa_hash (empresa_id, hash_sha256),
  CONSTRAINT fk_importacion_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_importacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documento_tributario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  origen ENUM('COMPRA','VENTA') NOT NULL,
  tipo_documento SMALLINT UNSIGNED NOT NULL,
  folio BIGINT UNSIGNED NOT NULL,
  rut_emisor VARCHAR(12) NOT NULL,
  rut_receptor VARCHAR(12) NOT NULL,
  proveedor_id BIGINT UNSIGNED,
  cliente_id BIGINT UNSIGNED,
  fecha_emision DATE NOT NULL,
  monto_neto DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_exento DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_iva DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_total DECIMAL(14,2) NOT NULL,
  xml_contenido LONGTEXT,
  estado ENUM('IMPORTADO','VINCULADO','ANULADO') NOT NULL DEFAULT 'IMPORTADO',
  importacion_id BIGINT UNSIGNED,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_documento_empresa_folio (empresa_id, tipo_documento, folio, rut_emisor),
  KEY ix_documento_fecha (empresa_id, fecha_emision),
  KEY ix_documento_proveedor (proveedor_id),
  KEY ix_documento_cliente (cliente_id),
  CONSTRAINT fk_documento_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_documento_tipo FOREIGN KEY (tipo_documento) REFERENCES tipo_documento(codigo),
  CONSTRAINT fk_documento_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
  CONSTRAINT fk_documento_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_documento_importacion FOREIGN KEY (importacion_id) REFERENCES importacion_archivo(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documento_tributario_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  documento_id BIGINT UNSIGNED NOT NULL,
  linea SMALLINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED,
  descripcion VARCHAR(200) NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_linea DECIMAL(14,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_documento_linea (documento_id, linea),
  CONSTRAINT fk_documento_detalle_documento FOREIGN KEY (documento_id) REFERENCES documento_tributario(id) ON DELETE CASCADE,
  CONSTRAINT fk_documento_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orden_compra (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  numero INT UNSIGNED NOT NULL,
  proveedor_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('BORRADOR','EMITIDA','RECIBIDA_PARCIAL','RECIBIDA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
  total_neto DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_iva DECIMAL(14,2) NOT NULL DEFAULT 0,
  total DECIMAL(14,2) NOT NULL DEFAULT 0,
  observacion VARCHAR(300),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orden_empresa_numero (empresa_id, numero),
  CONSTRAINT fk_orden_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_orden_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
  CONSTRAINT fk_orden_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orden_compra_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden_compra_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  cantidad_recibida DECIMAL(12,3) NOT NULL DEFAULT 0,
  costo_unitario DECIMAL(14,2) NOT NULL,
  UNIQUE KEY uq_orden_producto (orden_compra_id, producto_id),
  CONSTRAINT fk_orden_detalle_orden FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id) ON DELETE CASCADE,
  CONSTRAINT fk_orden_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT chk_orden_cantidades CHECK (cantidad > 0 AND cantidad_recibida >= 0 AND cantidad_recibida <= cantidad)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recepcion_mercaderia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  orden_compra_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  documento_id BIGINT UNSIGNED,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacion VARCHAR(300),
  CONSTRAINT fk_recepcion_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_recepcion_orden FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id),
  CONSTRAINT fk_recepcion_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT fk_recepcion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_recepcion_documento FOREIGN KEY (documento_id) REFERENCES documento_tributario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recepcion_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recepcion_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  costo_unitario DECIMAL(14,2) NOT NULL,
  lote_id BIGINT UNSIGNED,
  CONSTRAINT fk_recepcion_detalle_recepcion FOREIGN KEY (recepcion_id) REFERENCES recepcion_mercaderia(id) ON DELETE CASCADE,
  CONSTRAINT fk_recepcion_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_recepcion_detalle_lote FOREIGN KEY (lote_id) REFERENCES lote(id),
  CONSTRAINT chk_recepcion_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cuenta_por_pagar (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  proveedor_id BIGINT UNSIGNED NOT NULL,
  documento_id BIGINT UNSIGNED,
  orden_compra_id BIGINT UNSIGNED,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_total DECIMAL(14,2) NOT NULL,
  saldo DECIMAL(14,2) NOT NULL,
  estado ENUM('PENDIENTE','PARCIAL','PAGADA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  KEY ix_cxp_empresa_estado_vencimiento (empresa_id, estado, fecha_vencimiento),
  CONSTRAINT fk_cxp_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_cxp_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
  CONSTRAINT fk_cxp_documento FOREIGN KEY (documento_id) REFERENCES documento_tributario(id),
  CONSTRAINT fk_cxp_orden FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id),
  CONSTRAINT chk_cxp_saldo CHECK (saldo >= 0 AND saldo <= monto_total)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pago_proveedor (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cuenta_por_pagar_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  medio_pago ENUM('EFECTIVO','TRANSFERENCIA','CHEQUE','TARJETA','OTRO') NOT NULL,
  referencia VARCHAR(80),
  CONSTRAINT fk_pago_cxp FOREIGN KEY (cuenta_por_pagar_id) REFERENCES cuenta_por_pagar(id),
  CONSTRAINT fk_pago_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT chk_pago_monto CHECK (monto > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS venta (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  numero INT UNSIGNED NOT NULL,
  cliente_id BIGINT UNSIGNED,
  usuario_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  documento_id BIGINT UNSIGNED,
  folio_externo VARCHAR(30),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forma_pago ENUM('CONTADO','CREDITO') NOT NULL,
  medio_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  estado ENUM('CONFIRMADA','ANULADA') NOT NULL DEFAULT 'CONFIRMADA',
  total_neto DECIMAL(14,2) NOT NULL,
  total_iva DECIMAL(14,2) NOT NULL,
  total DECIMAL(14,2) NOT NULL,
  UNIQUE KEY uq_venta_empresa_numero (empresa_id, numero),
  KEY ix_venta_empresa_fecha (empresa_id, fecha),
  CONSTRAINT fk_venta_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_venta_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT fk_venta_documento FOREIGN KEY (documento_id) REFERENCES documento_tributario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS venta_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venta_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  precio_unitario DECIMAL(14,2) NOT NULL,
  descuento DECIMAL(14,2) NOT NULL DEFAULT 0,
  costo_unitario DECIMAL(14,2) NOT NULL,
  lote_id BIGINT UNSIGNED,
  CONSTRAINT fk_venta_detalle_venta FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
  CONSTRAINT fk_venta_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_venta_detalle_lote FOREIGN KEY (lote_id) REFERENCES lote(id),
  CONSTRAINT chk_venta_detalle_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cotizacion (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  numero INT UNSIGNED NOT NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  vigencia_hasta DATE NOT NULL,
  estado ENUM('PENDIENTE','ACEPTADA','RECHAZADA','VENCIDA','CONVERTIDA') NOT NULL DEFAULT 'PENDIENTE',
  venta_id BIGINT UNSIGNED,
  total DECIMAL(14,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_cotizacion_empresa_numero (empresa_id, numero),
  CONSTRAINT fk_cotizacion_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_cotizacion_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_cotizacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_cotizacion_venta FOREIGN KEY (venta_id) REFERENCES venta(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cotizacion_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  precio_unitario DECIMAL(14,2) NOT NULL,
  descuento DECIMAL(14,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_cotizacion_detalle_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizacion(id) ON DELETE CASCADE,
  CONSTRAINT fk_cotizacion_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT chk_cotizacion_detalle_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cuenta_por_cobrar (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  venta_id BIGINT UNSIGNED NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_total DECIMAL(14,2) NOT NULL,
  saldo DECIMAL(14,2) NOT NULL,
  estado ENUM('PENDIENTE','PARCIAL','COBRADA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  KEY ix_cxc_empresa_estado_vencimiento (empresa_id, estado, fecha_vencimiento),
  CONSTRAINT fk_cxc_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_cxc_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_cxc_venta FOREIGN KEY (venta_id) REFERENCES venta(id),
  CONSTRAINT chk_cxc_saldo CHECK (saldo >= 0 AND saldo <= monto_total)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cobro (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cuenta_por_cobrar_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  medio_pago ENUM('EFECTIVO','TRANSFERENCIA','CHEQUE','TARJETA','OTRO') NOT NULL,
  referencia VARCHAR(80),
  CONSTRAINT fk_cobro_cxc FOREIGN KEY (cuenta_por_cobrar_id) REFERENCES cuenta_por_cobrar(id),
  CONSTRAINT fk_cobro_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT chk_cobro_monto CHECK (monto > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimiento_inventario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  lote_id BIGINT UNSIGNED,
  tipo ENUM('ENTRADA_COMPRA','SALIDA_VENTA','AJUSTE_POSITIVO','AJUSTE_NEGATIVO','TRASPASO_ENTRADA','TRASPASO_SALIDA','DEVOLUCION_VENTA','DEVOLUCION_COMPRA') NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  costo_unitario DECIMAL(14,2) NOT NULL DEFAULT 0,
  saldo_posterior DECIMAL(12,3) NOT NULL,
  referencia_tipo ENUM('RECEPCION','VENTA','CONTEO','TRASPASO','MANUAL') NOT NULL,
  referencia_id BIGINT UNSIGNED,
  motivo VARCHAR(200),
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_movimiento_empresa_producto_fecha (empresa_id, producto_id, fecha),
  KEY ix_movimiento_referencia (referencia_tipo, referencia_id),
  CONSTRAINT fk_movimiento_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_movimiento_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT fk_movimiento_lote FOREIGN KEY (lote_id) REFERENCES lote(id),
  CONSTRAINT fk_movimiento_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conteo_fisico (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  bodega_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('ABIERTO','CERRADO','AJUSTADO') NOT NULL DEFAULT 'ABIERTO',
  observacion VARCHAR(300),
  CONSTRAINT fk_conteo_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_conteo_bodega FOREIGN KEY (bodega_id) REFERENCES bodega(id),
  CONSTRAINT fk_conteo_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conteo_fisico_detalle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conteo_id BIGINT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad_sistema DECIMAL(12,3) NOT NULL,
  cantidad_contada DECIMAL(12,3) NOT NULL,
  diferencia DECIMAL(12,3) GENERATED ALWAYS AS (cantidad_contada - cantidad_sistema) STORED,
  UNIQUE KEY uq_conteo_producto (conteo_id, producto_id),
  CONSTRAINT fk_conteo_detalle_conteo FOREIGN KEY (conteo_id) REFERENCES conteo_fisico(id) ON DELETE CASCADE,
  CONSTRAINT fk_conteo_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS importacion_error (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  importacion_id BIGINT UNSIGNED NOT NULL,
  linea INT UNSIGNED,
  codigo_error VARCHAR(40) NOT NULL,
  mensaje VARCHAR(300) NOT NULL,
  CONSTRAINT fk_importacion_error_importacion FOREIGN KEY (importacion_id) REFERENCES importacion_archivo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rcv_registro (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  importacion_id BIGINT UNSIGNED NOT NULL,
  libro ENUM('COMPRA','VENTA') NOT NULL,
  periodo CHAR(7) NOT NULL,
  tipo_documento SMALLINT UNSIGNED NOT NULL,
  folio BIGINT UNSIGNED NOT NULL,
  rut_contraparte VARCHAR(12) NOT NULL,
  razon_social VARCHAR(150) NOT NULL,
  fecha_documento DATE NOT NULL,
  monto_neto DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_exento DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_iva DECIMAL(14,2) NOT NULL DEFAULT 0,
  monto_total DECIMAL(14,2) NOT NULL,
  documento_id BIGINT UNSIGNED,
  estado_conciliacion ENUM('PENDIENTE','CONCILIADO','DIFERENCIA_MONTO','SIN_DOCUMENTO') NOT NULL DEFAULT 'PENDIENTE',
  UNIQUE KEY uq_rcv_empresa_libro_doc (empresa_id, libro, tipo_documento, folio, rut_contraparte),
  KEY ix_rcv_empresa_periodo_estado (empresa_id, periodo, estado_conciliacion),
  CONSTRAINT fk_rcv_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_rcv_importacion FOREIGN KEY (importacion_id) REFERENCES importacion_archivo(id),
  CONSTRAINT fk_rcv_tipo_documento FOREIGN KEY (tipo_documento) REFERENCES tipo_documento(codigo),
  CONSTRAINT fk_rcv_documento FOREIGN KEY (documento_id) REFERENCES documento_tributario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alerta (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('STOCK_MINIMO','SOBRESTOCK','VENCIMIENTO','PLAZO_TRIBUTARIO','DOCUMENTO_PENDIENTE','CUENTA_VENCIDA') NOT NULL,
  producto_id BIGINT UNSIGNED,
  lote_id BIGINT UNSIGNED,
  mensaje VARCHAR(250) NOT NULL,
  fecha_limite DATE,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_alerta_empresa_leida_tipo (empresa_id, leida, tipo),
  CONSTRAINT fk_alerta_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  CONSTRAINT fk_alerta_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
  CONSTRAINT fk_alerta_lote FOREIGN KEY (lote_id) REFERENCES lote(id)
) ENGINE=InnoDB;

INSERT IGNORE INTO tipo_documento (codigo, nombre, afecto_iva) VALUES
  (30, 'Factura', 1), (33, 'Factura electrónica', 1), (34, 'Factura exenta electrónica', 0),
  (39, 'Boleta electrónica', 1), (41, 'Boleta exenta', 0), (46, 'Factura de compra', 1),
  (52, 'Guía de despacho', 1), (56, 'Nota de débito', 1), (61, 'Nota de crédito', 1);

CREATE OR REPLACE VIEW v_stock_total AS
SELECT p.id AS producto_id, p.empresa_id, p.codigo, p.nombre, p.unidad_medida,
       p.stock_minimo, p.stock_maximo, COALESCE(SUM(sb.cantidad), 0) AS stock_total,
       CASE
         WHEN COALESCE(SUM(sb.cantidad), 0) < p.stock_minimo THEN 'BAJO_MINIMO'
         WHEN p.stock_maximo IS NOT NULL AND COALESCE(SUM(sb.cantidad), 0) > p.stock_maximo THEN 'SOBRESTOCK'
         ELSE 'NORMAL'
       END AS situacion
  FROM producto p LEFT JOIN stock_bodega sb ON sb.producto_id = p.id
 WHERE p.activo = 1
 GROUP BY p.id, p.empresa_id, p.codigo, p.nombre, p.unidad_medida, p.stock_minimo, p.stock_maximo;

CREATE OR REPLACE VIEW v_margen_venta AS
SELECT v.id AS venta_id, v.empresa_id, DATE(v.fecha) AS fecha,
       v.total_neto, COALESCE(SUM(vd.cantidad * vd.costo_unitario), 0) AS costo_total,
       v.total_neto - COALESCE(SUM(vd.cantidad * vd.costo_unitario), 0) AS margen
  FROM venta v JOIN venta_detalle vd ON vd.venta_id = v.id
 WHERE v.estado = 'CONFIRMADA'
 GROUP BY v.id, v.empresa_id, DATE(v.fecha), v.total_neto;

CREATE OR REPLACE VIEW v_resumen_cuentas AS
SELECT empresa_id, 'COBRAR' AS tipo, COUNT(*) AS documentos,
       SUM(saldo) AS saldo_pendiente,
       SUM(CASE WHEN fecha_vencimiento < CURDATE() THEN saldo ELSE 0 END) AS saldo_vencido
  FROM cuenta_por_cobrar WHERE estado IN ('PENDIENTE','PARCIAL')
 GROUP BY empresa_id
UNION ALL
SELECT empresa_id, 'PAGAR' AS tipo, COUNT(*) AS documentos,
       SUM(saldo) AS saldo_pendiente,
       SUM(CASE WHEN fecha_vencimiento < CURDATE() THEN saldo ELSE 0 END) AS saldo_vencido
  FROM cuenta_por_pagar WHERE estado IN ('PENDIENTE','PARCIAL')
 GROUP BY empresa_id;

CREATE OR REPLACE VIEW v_conciliacion_rcv AS
SELECT empresa_id, periodo, libro, estado_conciliacion,
       COUNT(*) AS registros, SUM(monto_total) AS monto_total
  FROM rcv_registro
 GROUP BY empresa_id, periodo, libro, estado_conciliacion;
