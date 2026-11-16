import { useState } from 'react';
import { Button, Card, Form, Spinner } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import ReadOnlyNotice from '../../../components/ui/ReadOnlyNotice';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../services/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRecepcionPendiente } from '../hooks/usePurchases';
import { purchasesService } from '../services/purchases.service';

export default function Reception() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: oc, isLoading } = useRecepcionPendiente();
  const [cant, setCant] = useState<Record<number, number>>({});
  const puede = can('inventario:crear') || can('compras:crear');

  const confirmar = useMutation({
    mutationFn: () => purchasesService.confirmarRecepcion({
      ordenCompraId: oc!.ordenCompraId,
      lineas: Object.entries(cant).filter(([, c]) => c > 0).map(([id, c]) => ({ productoId: Number(id), cantidad: c })),
    }),
    onSuccess: () => { toast('Recepción confirmada: stock y kardex actualizados'); setCant({}); qc.invalidateQueries({ queryKey: ['recepcion'] }); },
    onError: (e) => toast(getErrorMessage(e), 'danger'),
  });

  if (isLoading || !oc) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  return (
    <Card className="shadow-sm"><Card.Body>
      <Card.Title className="h6">Recepción · {oc.numero} · {oc.proveedor}</Card.Title>
      {!puede && <ReadOnlyNotice />}
      <DataTable data={oc.lineas} rowKey={(l) => l.productoId} columns={[
        { header: 'Producto', cell: (l) => l.producto },
        { header: 'Pedido', cell: (l) => l.pedido },
        { header: 'Recibido', cell: (l) => l.recibido },
        { header: 'Por recibir', cell: (l) => l.pedido - l.recibido },
        { header: 'Recibir ahora', cell: (l) => {
          const max = l.pedido - l.recibido;
          return (
            <Form.Control type="number" min={0} max={max} style={{ width: 100 }} disabled={!puede || max === 0}
              aria-label={`Recibir ${l.producto}`} value={cant[l.productoId] ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v > max) toast('No puedes recibir más de lo pedido', 'warning');
                setCant((c) => ({ ...c, [l.productoId]: Math.min(Math.max(v, 0), max) }));
              }} />
          );
        } },
      ]} />
      {puede && <Button className="mt-3" disabled={confirmar.isPending || !Object.values(cant).some((c) => c > 0)} onClick={() => confirmar.mutate()}>Confirmar recepción</Button>}
    </Card.Body></Card>
  );
}
