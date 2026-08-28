import React from 'react';
import { useReveal } from '../../hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  /** Atraso em ms, para escalonar blocos vizinhos. */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'footer';
}

/** Revela o bloco quando ele entra na viewport — uma vez só, sem repique. */
export const Reveal = ({ children, delay = 0, className = '', as = 'div' }: RevealProps) => {
  const { ref, isIn } = useReveal<HTMLDivElement>();
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal ${isIn ? 'is-in' : ''} ${className}`}
      style={{ ['--d' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};
