import { Card } from 'react-bootstrap';

interface Props { label: string; value: string; hint?: string; icon: string; variant?: string }

export default function KpiCard({ label, value, hint, icon, variant = 'primary' }: Props) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex justify-content-between align-items-start">
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fs-4 fw-bold">{value}</div>
          {hint && <div className="small text-muted">{hint}</div>}
        </div>
        <i className={`bi ${icon} fs-3 text-${variant}`} aria-hidden="true" />
      </Card.Body>
    </Card>
  );
}
