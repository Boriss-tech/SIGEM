import { Alert } from 'react-bootstrap';

export default function ReadOnlyNotice() {
  return <Alert variant="secondary" className="mb-3"><i className="bi bi-eye me-2" />Tu rol tiene acceso de solo consulta en esta sección.</Alert>;
}
