import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PoleBar } from '../ui/Pole';

/**
 * Fita de poste no topo a cada troca de rota. Curta o bastante para não
 * atrasar nada e longa o bastante para explicar a troca de tela.
 */
export const RouteProgress = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 620);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={`h-full origin-left transition-opacity duration-300 ${
          active ? 'anim-progress opacity-100' : 'opacity-0'
        }`}
      >
        <PoleBar />
      </div>
    </div>
  );
};

/** Envelope de entrada de página: remonta a cada rota, então a animação reinicia. */
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="anim-rise">
      {children}
    </div>
  );
};
