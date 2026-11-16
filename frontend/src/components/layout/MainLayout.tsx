import { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className="sidebar d-none d-lg-block">
        <div className="sidebar-brand">🏪 SIGEM-Pyme</div>
        <Sidebar />
      </aside>
      <Offcanvas show={open} onHide={() => setOpen(false)} className="sidebar" style={{ width: 240 }}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>🏪 SIGEM-Pyme</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0"><Sidebar onNavigate={() => setOpen(false)} /></Offcanvas.Body>
      </Offcanvas>
      <div className="app-main">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="p-3 p-lg-4"><Outlet /></main>
      </div>
    </div>
  );
}
