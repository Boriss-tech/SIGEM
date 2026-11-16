import { useState } from 'react';
import { Form } from 'react-bootstrap';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useKardex } from '../hooks/useInventory';

export default function KardexTable() {
  const { data = [], isLoading } = useKardex();
  const [tipo, setTipo] = useState('');
  const tipos = [...new Set(data.map((m) => m.tipo))];
  return (
    <>
      <Form.Select className="mb-2" style={{ maxWidth: 260 }} aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="">Todos los tipos</option>
        {tipos.map((t) => <option key={t}>{t}</option>)}
      </Form.Select>
      <DataTable loading={isLoading} data={tipo ? data.filter((m) => m.tipo === tipo) : data} rowKey={(m) => m.id} columns={[
        { header: 'Fecha', cell: (m) => m.fecha },
        { header: 'Producto', cell: (m) => m.producto },
        { header: 'Tipo', cell: (m) => <StatusBadge value={m.tipo} /> },
        { header: 'Cantidad', cell: (m) => m.cantidad },
        { header: 'Saldo', cell: (m) => m.saldoPosterior },
        { header: 'Origen', cell: (m) => m.origen },
        { header: 'Usuario', cell: (m) => m.usuario },
      ]} />
    </>
  );
}
