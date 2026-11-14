import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/http';

const schema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});
type LoginValues = z.infer<typeof schema>;

const demoEmails = ['admin', 'ventas', 'bodega', 'administrativo', 'contador'].map((role) => `${role}@sigem.cl`);

export function Login() {
  const { login } = useAuth();
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<LoginValues>();

  const submit = handleSubmit(async (form) => {
    setFormError('');
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === 'email' || field === 'password') setError(field, { message: issue.message });
      });
      return;
    }
    setSubmitting(true);
    try {
      await login(parsed.data.email, parsed.data.password);
    } catch (reason) {
      setFormError(reason instanceof ApiError ? reason.message : 'No fue posible iniciar sesión. Revisa la conexión e intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="login-wrap">
      <section className="login-card" aria-labelledby="login-title">
        <div className="d-flex align-items-center gap-3 mb-4">
          <span className="brand-mark"><i className="bi bi-shop-window" /></span>
          <div>
            <div className="fw-bold">SIGEM-Pyme</div>
            <div className="small muted">Gestión simple para tu negocio</div>
          </div>
        </div>
        <h1 id="login-title" className="h3 fw-bold">Inicia sesión</h1>
        <p className="muted mb-4">Ingresa tus credenciales para continuar.</p>
        {formError && <Alert variant="danger" role="alert">{formError}</Alert>}
        <Form onSubmit={(event) => void submit(event)} noValidate>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              autoComplete="username"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
          </Form.Group>
          <Button type="submit" className="w-100" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </Form>
        {import.meta.env.VITE_SHOW_DEMO_USERS === 'true' && (
          <div className="mt-4 pt-3 border-top">
            <div className="small muted mb-2">Usuarios demo (la contraseña se configura en server/.env):</div>
            <div className="d-flex flex-wrap gap-2">
              {demoEmails.map((email) => (
                <button key={email} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setValue('email', email)}>
                  {email.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="small muted mt-4 mb-0">SIGEM-Pyme administra referencias tributarias; no emite documentos.</p>
      </section>
    </main>
  );
}
