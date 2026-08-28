import React from 'react';

/**
 * Esqueletos de carregamento. O brilho corre em diagonal — a mesma
 * inclinação da hélice do poste — para que a espera pareça parte da marca.
 */

interface SkeletonProps {
  className?: string;
  rounded?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className = '', rounded = 'rounded-md', dark, style }: SkeletonProps) => (
  <span
    className={`skeleton ${dark ? 'skeleton-dark' : ''} block ${rounded} ${className}`}
    style={style}
  />
);

const shell = 'card p-5';

/** Bloco genérico de linhas de texto. */
export const SkeletonLines = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3" style={{ width: `${92 - i * 14}%` }} />
    ))}
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-64" rounded="rounded-lg" />
  </div>
);

/** Fallback padrão de rota (Suspense). */
export const RouteSkeleton = () => (
  <div className="space-y-8 anim-fade">
    <PageHeaderSkeleton />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={shell} style={{ opacity: 1 - i * 0.08 }}>
          <Skeleton className="h-10 w-10" rounded="rounded-lg" />
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const StatGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-4 sm:p-5">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-4 h-8 w-16" rounded="rounded-lg" />
      </div>
    ))}
  </div>
);

export const CalendarSkeleton = () => (
  <div className="card p-4 sm:p-6">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-5 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="rounded-lg" />
        <Skeleton className="h-8 w-8" rounded="rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-10 sm:h-12" rounded="rounded-lg" />
      ))}
    </div>
  </div>
);

export const BookingSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-12">
    <div className="space-y-6 lg:col-span-7 xl:col-span-8">
      <CalendarSkeleton />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <Skeleton className="h-11 w-11" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card flex items-center justify-between gap-4 p-5">
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2.5 w-56" />
            </div>
            <Skeleton className="h-8 w-20" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
    <div className="lg:col-span-5 xl:col-span-4">
      <div className="comanda space-y-5 p-6">
        <Skeleton className="h-3 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-9 w-9" rounded="rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full" rounded="rounded-xl" />
      </div>
    </div>
  </div>
);

export const AppointmentCardsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11" rounded="rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" rounded="rounded-md" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line-soft pt-5">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const AgendaSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card flex flex-col gap-5 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-44">
          <Skeleton className="h-12 w-14" rounded="rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" rounded="rounded-lg" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="card overflow-hidden">
    <div className="border-b border-line bg-chalk/60 px-5 py-3.5">
      <Skeleton className="h-2.5 w-32" />
    </div>
    <div className="divide-y divide-line-soft">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 px-5 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-3.5"
              style={{ width: c === 0 ? '32%' : `${Math.max(12, 22 - c * 3)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="card p-6">
    <div className="mb-6 flex items-center gap-3">
      <Skeleton className="h-10 w-10" rounded="rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-2.5 w-36" />
      </div>
    </div>
    <div className="flex h-64 items-end gap-2 sm:gap-3">
      {[42, 66, 38, 84, 54, 72, 96].map((h, i) => (
        <Skeleton key={i} className="flex-1" rounded="rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="mx-auto max-w-2xl space-y-8">
    <PageHeaderSkeleton />
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-4 border-b border-line-soft pb-8">
        <Skeleton className="h-20 w-20" rounded="rounded-full" />
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-6 pt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-11 w-full" rounded="rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-11 w-44" rounded="rounded-lg" />
      </div>
    </div>
  </div>
);
