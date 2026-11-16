import { useEffect, useState } from 'react';
import { Button, Card, Form, Spinner } from 'react-bootstrap';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../auth/hooks/useAuth';
import { useParametros } from '../hooks/useAdmin';
import { adminService } from '../services/admin.service';
import type { ParametroEmpresa } from '../types/admin.types';

export default function ParametersForm() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, isLoading } = useParametros();
  const [items, setItems] = useState<ParametroEmpresa[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]);
  const editable = can('parametros:editar');
  if (isLoading) return <Spinner animation="border" />;
  return (
    <Card className="shadow-sm" style={{ maxWidth: 560 }}><Card.Body>
      {items.map((p, i) => (
        <Form.Group key={p.clave} className="mb-3" controlId={p.clave}>
          <Form.Label>{p.clave}</Form.Label>
          <Form.Control value={p.valor} disabled={!editable} onChange={(e) => setItems((l) => l.map((x, j) => j === i ? { ...x, valor: e.target.value } : x))} />
          <Form.Text>{p.descripcion}</Form.Text>
        </Form.Group>
      ))}
      {editable && <Button onClick={async () => { await adminService.saveParametros(items); toast('Parámetros guardados'); }}>Guardar parámetros</Button>}
    </Card.Body></Card>
  );
}
