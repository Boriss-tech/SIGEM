import { useMemo, useState, type ReactNode } from 'react';
import { Form, Spinner, Table } from 'react-bootstrap';
import { useDebounce } from '../../hooks/useDebounce';

export interface Column<T> { header: string; cell: (row: T) => ReactNode; className?: string }

interface Props<T> {
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  rowKey: (row: T) => string | number;
  searchable?: boolean;
  empty?: string;
}

/** Tabla reutilizable. Para listas grandes, el backend debería paginar (RNF-02). */
export default function DataTable<T>({ columns, data = [], loading, rowKey, searchable, empty = 'Sin registros' }: Props<T>) {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 250).toLowerCase();
  const rows = useMemo(() => (dq ? data.filter((r) => JSON.stringify(r).toLowerCase().includes(dq)) : data), [data, dq]);

  if (loading) return <div className="text-center py-4"><Spinner animation="border" role="status" /></div>;
  return (
    <>
      {searchable && (
        <Form.Control className="mb-2" placeholder="Buscar…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
      )}
      <div className="table-responsive">
        <Table hover className="align-middle mb-0 bg-white">
          <thead>
            <tr>{columns.map((c) => <th key={c.header} className="text-nowrap">{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)}>{columns.map((c) => <td key={c.header} className={c.className}>{c.cell(r)}</td>)}</tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length} className="text-center text-muted py-4">{empty}</td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  );
}
