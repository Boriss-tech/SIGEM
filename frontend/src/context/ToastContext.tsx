import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type Variant = 'success' | 'danger' | 'info' | 'warning';
interface Msg { id: number; text: string; variant: Variant }

const Ctx = createContext<(text: string, variant?: Variant) => void>(() => undefined);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Msg[]>([]);
  const push = useCallback((text: string, variant: Variant = 'success') => {
    setItems((i) => [...i, { id: Date.now() + Math.random(), text, variant }]);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 2000 }}>
        {items.map((t) => (
          <Toast key={t.id} bg={t.variant} show autohide delay={3500}
            onClose={() => setItems((i) => i.filter((x) => x.id !== t.id))}>
            <Toast.Body className={t.variant === 'warning' ? '' : 'text-white'}>{t.text}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Ctx.Provider>
  );
}
