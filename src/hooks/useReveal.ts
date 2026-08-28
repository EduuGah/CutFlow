import { useEffect, useRef, useState } from 'react';

/**
 * Revela um bloco quando ele entra na viewport. Dispara uma única vez.
 * Sem IntersectionObserver (ou em ambiente de teste) o conteúdo já nasce visível.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsIn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsIn(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isIn };
}
