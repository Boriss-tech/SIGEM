import { useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../services/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useConteo } from '../hooks/useInventory';
import { inventoryService } from '../services/inventory.service';

export default function StockCount() {
  const { can } = useAuth();
  const toast = useToast();
  const editable = can('inventario:editar');
  const { data = [], isLoading } = useConteo();
  const [contado, setContado] = useState<Record<number, string>>({});
  const [motivo, setMotivo] = useState('');

  const ajustar = useMutation({
    mutationFn: () => inventoryService.ajustarConteo({
      motivo,
      lineas: data.map((l) => ({ ...l, cantidadContada: contado[l.productoId] === undefined ? undefined : Number(contado[l.productoId]) })),
    }),
    onSuccess: () => { toast('Ajustes generados en el kardex'); setMotivo(''); },
    onError: (e) => toast(getErrorMessage(e), 'danger'),
  });

  return (
    <>
      <DataTable loading={isLoading} data={data} rowKey={(l) => l.productoId} columns={[
        { header: 'Producto', cell: (l) => l.producto },
        { header: 'Sistema', cell: (l) => l.cantidadSistema },
        { header: 'Contado', cell: (l) => (
          <Form.Control type="number" min={0} style={{ width: 100 }} disabled={!editable} aria-label={`Contado ${l.producto}`}
            value={contado[l.productoId] ?? ''} onChange={(e) => setContado((c) => ({ ...c, [l.productoId]: e.target.value }))} />) },
        { header: 'Diferencia', cell: (l) => {
          const v = contado[l.productoId];
          if (v === undefined || v === '') return '—';
          const d = Number(v) - l.cantidadSistema;
          return <Badge bg={d === 0 ? 'success' : d > 0 ? 'warning' : 'danger'} text={d > 0 ? 'dark' : undefined}>{d > 0 ? `+${d}` : d}</Badge>;
        } },
      ]} />
      {editable && (
        <div className="d-flex flex-wrap gap-2 mt-3 align-items-end">
          <Form.Control style={{ maxWidth: 320 }} placeholder="Motivo del ajuste (obligatorio)" aria-label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <Button disabled={!motivo.trim() || ajustar.isPending} onClick={() => ajustar.mutate()}>Cerrar y ajustar stock</Button>
        </div>
      )}
    </>
  );
}
