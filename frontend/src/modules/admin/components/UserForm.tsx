import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RolCodigo } from '../../auth/types/auth.types';

const ROLES: RolCodigo[] = ['ADMIN', 'ADMINISTRATIVO', 'BODEGA', 'VENTAS', 'CONTADOR'];
const schema = z.object({
  nombre: z.string().min(3, 'Ingresa el nombre completo'),
  email: z.string().email('Correo inválido'),
  rol: z.enum(['ADMIN', 'ADMINISTRATIVO', 'BODEGA', 'VENTAS', 'CONTADOR']),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export type UserFormValues = z.infer<typeof schema>;

interface Props { show: boolean; onHide: () => void; onSubmit: (v: UserFormValues) => Promise<void> }

export default function UserForm({ show, onHide, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<UserFormValues>({ resolver: zodResolver(schema), defaultValues: { rol: 'VENTAS' } });
  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate onSubmit={handleSubmit(async (v) => { await onSubmit(v); reset(); })}>
        <Modal.Header closeButton><Modal.Title className="h5">Nuevo usuario</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2" controlId="u-nombre"><Form.Label>Nombre</Form.Label>
            <Form.Control isInvalid={!!errors.nombre} {...register('nombre')} />
            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback></Form.Group>
          <Form.Group className="mb-2" controlId="u-email"><Form.Label>Correo</Form.Label>
            <Form.Control type="email" isInvalid={!!errors.email} {...register('email')} />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback></Form.Group>
          <Form.Group className="mb-2" controlId="u-rol"><Form.Label>Rol</Form.Label>
            <Form.Select {...register('rol')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Form.Select></Form.Group>
          <Form.Group controlId="u-pass"><Form.Label>Contraseña inicial</Form.Label>
            <Form.Control type="password" isInvalid={!!errors.password} {...register('password')} />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback></Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>Crear usuario</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
