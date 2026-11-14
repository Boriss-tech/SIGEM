import { Alert } from 'react-bootstrap';

export function ModulePage({ title, icon }: { title: string; icon: string }) {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="small muted">SIGEM-Pyme / Gestión</div>
          <h1 className="h3 fw-bold mb-0"><i className={`bi ${icon} me-2 text-primary`} aria-hidden="true" />{title}</h1>
        </div>
      </header>
      <section className="surface-card">
        <Alert variant="info" className="mb-0">
          <div className="fw-semibold mb-1">Módulo planificado</div>
          <div>Este espacio se habilitará en la siguiente fase de desarrollo. El sistema todavía no guarda ni modifica datos desde esta pantalla.</div>
        </Alert>
      </section>
    </>
  );
}
