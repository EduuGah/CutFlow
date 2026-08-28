import { useEffect, useState } from 'react';

/**
 * Mantém um elemento montado enquanto a animação de saída roda.
 *
 * `mounted` diz se o nó deve existir no DOM; `state` alimenta o
 * atributo `data-state` que dispara as transições de entrada e saída no CSS.
 */
export function usePresence(open: boolean, exitDuration = 320) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);

      // Dois quadros: o navegador precisa pintar o estado inicial antes
      // de recebermos o estado final, senão não existe transição.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });

      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), exitDuration);
    return () => window.clearTimeout(timer);
  }, [open, exitDuration]);

  return { mounted, state: (visible ? 'open' : 'closed') as 'open' | 'closed' };
}
