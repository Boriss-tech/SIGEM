import { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import { useToast } from '../../../context/ToastContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { getErrorMessage } from '../../../services/api';
import { formatCLP } from '../../../utils/formatCLP';
import { useProducts } from '../../inventory/hooks/useInventory'; // dependencia entre módulos: solo lectura
import { useClientes } from '../hooks/useSales';
import { salesService } from '../services/sales.service';

export default function PosForm() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: productos = [], isLoading } = useProducts();
  const { data: clientes = [] } = useClientes();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 200).toLowerCase();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [clienteId, setClienteId] = useState('');
  const [formaPago, setFormaPago] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [folio, setFolio] = useState('');

  const lista = productos.filter((p) => `${p.nombre}${p.codigo}${p.codigoBarras ?? ''}`.toLowerCase().includes(dq));
  const lineas = Object.entries(cart).map(([id, qty]) => ({ p: productos.find((x) => x.id === Number(id))!, qty }));
  const total = lineas.reduce((s, l) => s + l.p.precioVenta * l.qty, 0);

  const add = (id: number, d = 1) => {
    const p = productos.find((x) => x.id === id)!;
    const n = (cart[id] ?? 0) + d;
    if (n > p.stock) return toast(`Stock insuficiente de ${p.nombre} (${p.stock})`, 'warning');
    setCart((c) => {
      const { [id]: _omit, ...rest } = c;
      return n > 0 ? { ...rest, [id]: n } : rest;
    });
  };

  const venta = useMutation({
    mutationFn: () => salesService.createSale({
      clienteId: clienteId ? Number(clienteId) : undefined, formaPago, medioPago,
      folioExterno: folio || undefined, lineas: lineas.map((l) => ({ productoId: l.p.id, cantidad: l.qty })),
    }),
    onSuccess: () => {
      toast('Venta registrada: stock descontado y kardex actualizado');
      setCart({}); setFolio('');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'danger'),
  });

  return (
    <Row className="g-3">
      <Col lg={7}>
        <Card className="shadow-sm"><Card.Body>
          <Form.Control autoFocus placeholder="Buscar o escanear código de barras…" aria-label="Buscar producto"
            value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
          <DataTable loading={isLoading} data={lista} rowKey={(p) => p.id} columns={[
            { header: 'Producto', cell: (p) => p.nombre },
            { header: 'Stock', cell: (p) => p.stock },
            { header: 'Precio', cell: (p) => formatCLP(p.precioVenta) },
            { header: '', cell: (p) => <Button size="sm" variant="outline-primary" aria-label={`Agregar ${p.nombre}`} onClick={() => add(p.id)}><i className="bi bi-plus-lg" /></Button> },
          ]} />
        </Card.Body></Card>
      </Col>
      <Col lg={5}>
        <Card className="shadow-sm"><Card.Body>
          <Card.Title className="h6">Venta actual</Card.Title>
          {lineas.length === 0 && <p className="text-muted">Agrega productos para comenzar.</p>}
          {lineas.map(({ p, qty }) => (
            <div key={p.id} className="d-flex align-items-center gap-2 mb-2">
              <span className="flex-grow-1">{p.nombre}</span>
              <Button size="sm" variant="outline-secondary" onClick={() => add(p.id, -1)} aria-label="Quitar uno"><i className="bi bi-dash" /></Button>
              <strong>{qty}</strong>
              <Button size="sm" variant="outline-secondary" onClick={() => add(p.id, 1)} aria-label="Agregar uno"><i className="bi bi-plus" /></Button>
              <span style={{ width: 90 }} className="text-end">{formatCLP(p.precioVenta * qty)}</span>
            </div>
          ))}
          <div className="fs-4 fw-bold text-end my-3">Total {formatCLP(total)}</div>
          <Form.Group className="mb-2" controlId="cliente"><Form.Label>Cliente</Form.Label>
            <Form.Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Consumidor final</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
            </Form.Select></Form.Group>
          <Row className="g-2">
            <Col><Form.Group controlId="forma"><Form.Label>Forma de pago</Form.Label>
              <Form.Select value={formaPago} onChange={(e) => setFormaPago(e.target.value as 'CONTADO' | 'CREDITO')}>
                <option value="CONTADO">Contado</option><option value="CREDITO">Crédito</option></Form.Select></Form.Group></Col>
            <Col><Form.Group controlId="medio"><Form.Label>Medio de pago</Form.Label>
              <Form.Select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                <option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option></Form.Select></Form.Group></Col>
          </Row>
          <Form.Group className="mt-2" controlId="folio"><Form.Label>Folio del documento externo</Form.Label>
            <Form.Control value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="Ej: 20331" />
            <Form.Text>El sistema no emite DTE: aquí solo se registra el folio emitido en otro sistema.</Form.Text></Form.Group>
          <Button className="w-100 mt-3" disabled={!lineas.length || venta.isPending} onClick={() => venta.mutate()}>
            {venta.isPending ? 'Registrando…' : 'Confirmar venta'}
          </Button>
        </Card.Body></Card>
      </Col>
    </Row>
  );
}
