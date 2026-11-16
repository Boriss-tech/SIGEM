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
        <Form.Label>Correo</Form.Label>
        <Form.Control type="email" autoComplete="username" isInvalid={!!errors.email} {...register('email')} />
        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Contraseña</Form.Label>
        <InputGroup hasValidation>
          <Form.Control type={show ? 'text' : 'password'} autoComplete="current-password"
            isInvalid={!!errors.password} {...register('password')} />
          <Button variant="outline-secondary" onClick={() => setShow((s) => !s)} aria-label="Mostrar u ocultar contraseña">
            <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      <Button type="submit" className="w-100" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>

      {USE_MOCK && (
        <div className="mt-4">
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
