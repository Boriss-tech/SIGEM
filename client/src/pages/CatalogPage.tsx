import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Form, Modal, Table } from 'react-bootstrap';
import { ApiError, request } from '../api/http';
import { formatClp } from '../utils/format';

type CatalogKind = 'productos' | 'proveedores' | 'clientes';
interface CatalogItem {
  id: number;
  codigo?: string;
  nombre?: string;
  codigo_barras?: string | null;
  razon_social?: string;
  rut?: string | null;
  unidad_medida?: string;
  costo_promedio?: number;
  precio_venta?: number;
  stock_minimo?: number;
  stock_total?: number;
  dias_pago?: number;
  email?: string | null;
  telefono?: string | null;
  categoria?: string | null;
}
interface CatalogResult {
  items: CatalogItem[];
  total: number;
}

const definitions: Record<CatalogKind, { title: string; icon: string; fields: string[] }> = {
  productos: { title: 'Productos', icon: 'bi-box-seam', fields: ['codigo', 'nombre', 'unidad_medida', 'costo_promedio', 'precio_venta', 'stock_minimo'] },
  proveedores: { title: 'Proveedores', icon: 'bi-truck', fields: ['rut', 'razon_social', 'email', 'telefono', 'dias_pago'] },
  clientes: { title: 'Clientes', icon: 'bi-person-vcard', fields: ['rut', 'razon_social', 'email', 'telefono'] },
};

const labels: Record<string, string> = {
  codigo: 'Código', nombre: 'Nombre del producto', unidad_medida: 'Unidad', costo_promedio: 'Costo promedio',
  precio_venta: 'Precio de venta', stock_minimo: 'Stock mínimo', rut: 'RUT', razon_social: 'Razón social',
  email: 'Correo', telefono: 'Teléfono', dias_pago: 'Días de pago',
};

export function CatalogPage({ kind }: { kind: CatalogKind }) {
  const queryClient = useQueryClient();
  const definition = definitions[kind];
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog', kind, search],
    queryFn: () => request<CatalogResult>(`/${kind}?q=${encodeURIComponent(search)}`),
  });
  const create = useMutation({
    mutationFn: (body: Record<string, string | number | null>) =>
      request(`/${kind}`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['catalog', kind] });
      setShowForm(false);
      setValues({});
      setFormError('');
    },
    onError: (reason) => setFormError(reason instanceof ApiError ? reason.message : 'No se pudo guardar el registro. Revisa los datos e intenta nuevamente.'),
  });
  const deactivate = useMutation({
    mutationFn: (id: number) => request(`/${kind}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog', kind] }),
    onError: (reason) => setFormError(reason instanceof ApiError ? reason.message : 'No se pudo desactivar el registro.'),
  });
  const columns = useMemo(() => {
    if (kind === 'productos') return ['codigo', 'nombre', 'categoria', 'unidad_medida', 'stock_total', 'precio_venta'];
    if (kind === 'proveedores') return ['rut', 'razon_social', 'email', 'telefono', 'dias_pago'];
    return ['rut', 'razon_social', 'email', 'telefono'];
  }, [kind]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const body: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(values)) {
      if (key === 'rut' && kind === 'clientes' && !value.trim()) body[key] = null;
      else if (['costo_promedio', 'precio_venta', 'stock_minimo', 'dias_pago'].includes(key)) body[key] = Number(value);
      else if (value.trim()) body[key] = value.trim();
    }
    if (kind === 'productos') {
      body.unidad_medida = values.unidad_medida ?? 'UN';
      body.costo_promedio = Number(values.costo_promedio);
      body.precio_venta = Number(values.precio_venta);
      body.stock_minimo = Number(values.stock_minimo);
      body.codigo_barras = null;
      body.stock_maximo = null;
      body.controla_vencimiento = false;
    }
    create.mutate(body);
  };

  const cellValue = (item: CatalogItem, field: string) => {
    const value = item[field as keyof CatalogItem];
    if (field === 'precio_venta') return typeof value === 'number' ? formatClp(value) : '—';
    if (field === 'stock_total') return `${value ?? 0} ${item.unidad_medida ?? ''}`;
    if (field === 'dias_pago') return value === 0 ? 'Contado' : `${value} días`;
    return value || '—';
  };

  return (
    <>
      <header className="topbar">
        <div>
          <div className="small muted">SIGEM-Pyme / Gestión</div>
          <h1 className="h3 fw-bold mb-0"><i className={`bi ${definition.icon} me-2 text-primary`} aria-hidden="true" />{definition.title}</h1>
        </div>
        <Button onClick={() => { setShowForm(true); setFormError(''); }}>
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />Agregar {kind === 'productos' ? 'producto' : kind === 'clientes' ? 'cliente' : 'proveedor'}
        </Button>
      </header>
      {formError && !showForm && <Alert variant="danger" role="alert">{formError}</Alert>}
      {error && <Alert variant="danger" role="alert">No se pudo cargar el listado. Revisa tu conexión e intenta nuevamente.</Alert>}
      <section className="surface-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div className="muted small">{data?.total ?? 0} registros activos</div>
          <Form.Control
            type="search"
            className="catalog-search"
            placeholder={`Buscar ${definition.title.toLocaleLowerCase('es-CL')}`}
            aria-label={`Buscar ${definition.title.toLocaleLowerCase('es-CL')}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {isLoading ? <div className="muted py-4" role="status">Cargando registros…</div> : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead><tr>{columns.map((field) => <th key={field}>{labels[field] ?? field}</th>)}<th className="text-end">Acciones</th></tr></thead>
              <tbody>
                {data?.items.length ? data.items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((field) => <td key={field}>{cellValue(item, field)}</td>)}
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        aria-label={`Desactivar ${item.nombre ?? item.razon_social ?? ''}`}
                        onClick={() => {
                          const name = item.nombre ?? item.razon_social ?? 'este registro';
                          if (window.confirm(`¿Desactivar ${name}?`)) deactivate.mutate(item.id);
                        }}
                      >
                        <i className="bi bi-archive" aria-hidden="true" /><span className="visually-hidden">Desactivar</span>
                      </Button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={columns.length + 1} className="text-center muted py-5">
                  {search ? 'No encontramos resultados. Prueba con otro término.' : 'Todavía no hay registros. Agrega el primero para comenzar.'}
                </td></tr>}
              </tbody>
            </Table>
          </div>
        )}
      </section>
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={submit}>
          <Modal.Header closeButton><Modal.Title>Agregar {kind === 'productos' ? 'producto' : kind === 'clientes' ? 'cliente' : 'proveedor'}</Modal.Title></Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger" role="alert">{formError}</Alert>}
            {definition.fields.map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{labels[field]}</Form.Label>
                {field === 'unidad_medida' ? (
                  <Form.Select value={values[field] ?? 'UN'} onChange={(event) => setValues({ ...values, [field]: event.target.value })}>
                    <option value="UN">Unidad (UN)</option><option value="KG">Kilogramo (KG)</option><option value="LT">Litro (LT)</option><option value="CJ">Caja (CJ)</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    type={['costo_promedio', 'precio_venta', 'stock_minimo', 'dias_pago'].includes(field) ? 'number' : field === 'email' ? 'email' : 'text'}
                    min={['costo_promedio', 'precio_venta', 'stock_minimo', 'dias_pago'].includes(field) ? 0 : undefined}
                    step={field === 'stock_minimo' ? '0.001' : '0.01'}
                    required={
                      ['codigo', 'nombre', 'costo_promedio', 'precio_venta', 'stock_minimo', 'razon_social'].includes(field) ||
                      (field === 'rut' && kind === 'proveedores')
                    }
                    value={values[field] ?? ''}
                    onChange={(event) => setValues({ ...values, [field]: event.target.value })}
                  />
                )}
              </Form.Group>
            ))}
            <div className="small muted">Los datos se guardan en la empresa asociada a tu sesión.</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Guardando…' : 'Guardar registro'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
