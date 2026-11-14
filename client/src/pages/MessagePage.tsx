import { Link } from 'react-router-dom';

export function MessagePage({ code, title, message }: { code: string; title: string; message: string }) {
  return (
    <section className="login-wrap">
      <div className="login-card text-center">
        <div className="display-4 fw-bold text-primary">{code}</div>
        <h1 className="h3 fw-bold">{title}</h1>
        <p className="muted">{message}</p>
        <Link className="btn btn-primary" to="/">Volver al panel</Link>
      </div>
    </section>
  );
}
