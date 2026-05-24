import React from 'react';

export function Skeleton({ width = '100%', height = 14, style }: {
  width?: string | number; height?: number; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeletonShimmer 1.2s ease-in-out infinite',
      ...style,
    }} />
  );
}

export function SkeletonBlock({ lines = 3, width, style }: {
  lines?: number; width?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : width ?? '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fff',
      display: 'flex', flexDirection: 'column', gap: 12, ...style,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Skeleton width={32} height={32} style={{ borderRadius: '50%' }} />
        <Skeleton width="40%" height={14} />
      </div>
      <Skeleton width="90%" height={12} />
      <Skeleton width="75%" height={12} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton width={60} height={24} style={{ borderRadius: 12 }} />
        <Skeleton width={80} height={24} style={{ borderRadius: 12 }} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, style }: { rows?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton width={20} height={20} />
          <Skeleton width="15%" height={14} />
          <Skeleton width="30%" height={14} />
          <div style={{ flex: 1 }} />
          <Skeleton width={70} height={22} style={{ borderRadius: 11 }} />
        </div>
      ))}
    </div>
  );
}

// Inject global keyframes once
const keyframes = `@keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
if (typeof document !== 'undefined') {
  const id = '__skeleton_keyframes';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = keyframes;
    document.head.appendChild(style);
  }
}
