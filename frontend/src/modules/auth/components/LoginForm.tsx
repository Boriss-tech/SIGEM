import { useState } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { USE_MOCK } from '../../../services/api';
import { DEMO_ACCOUNTS } from '../../../services/mock/db';

const schema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
export type LoginValues = z.infer<typeof schema>;

interface Props { onSubmit: (v: LoginValues) => Promise<void>; error: string | null }

export default function LoginForm({ onSubmit, error }: Props) {
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<LoginValues>({ resolver: zodResolver(schema) });

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}

      <Form.Group className="mb-3" controlId="email">
        <Form.Label className="fw-semibold">Correo</Form.Label>
        <Form.Control size="lg" type="email" placeholder="nombre@minimarket.cl" autoComplete="username"
          isInvalid={!!errors.email} {...register('email')} />
        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="password">
        <Form.Label className="fw-semibold">Contraseña</Form.Label>
        <InputGroup size="lg" hasValidation>
          <Form.Control type={show ? 'text' : 'password'} autoComplete="current-password"
            isInvalid={!!errors.password} {...register('password')} />
          <Button variant="outline-secondary" onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Button type="submit" size="lg" className="w-100 fw-semibold" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-muted small mt-3 mb-0">
        ¿Problemas para ingresar? Estamos disponibles para ayudarte.
      </p>

      {/* Solo en modo demo (VITE_USE_MOCK=true). Desaparece al conectar el backend. */}
      {USE_MOCK && (
        <div className="mt-4 pt-3 border-top">
          <small className="text-muted d-block mb-2">Modo demo (clave: demo1234). Entrar como:</small>
          <div className="d-flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button key={a.email} size="sm" variant="outline-secondary"
                onClick={() => { setValue('email', a.email); setValue('password', 'demo1234'); }}>
                {a.rolNombre}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Form>
  );
}