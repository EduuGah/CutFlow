import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
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
    <motion.div 
      key={location.pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
