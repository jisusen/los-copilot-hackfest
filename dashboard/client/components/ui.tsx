import React from 'react';

// Shared UI primitives for the redesign

export function Card({ children, className = '', style, onClick, 'data-testid': dataTestId }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void; 'data-testid'?: string }) {
  return (
    <div
      data-testid={dataTestId}
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = '#6366f1',
  bg,
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}) {
  const background = bg ?? `${color}18`;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color,
        background,
        fontFamily: '"JetBrains Mono", monospace',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  color = '#6366f1',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  style,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
    secondary: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: '#ef4444', color: '#fff', border: '1px solid #ef4444' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
  };
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms ease',
        ...v,
        ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = '#4f46e5';
        if (variant === 'secondary') e.currentTarget.style.background = '#64748b';
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = '#6366f1';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--surface-2)';
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

export function StatusDot({ color = '#6366f1', size = 6 }: { color?: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

export function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--surface-2)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

