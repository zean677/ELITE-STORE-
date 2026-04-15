import React from 'react';
import { useLanguage } from '@/i18n';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  processing: 'bg-secondary/15 text-secondary border-secondary/30',
  completed: 'bg-success/15 text-success border-success/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  refunded: 'bg-muted text-muted-foreground border-border',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  active: 'bg-success/15 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage();
  const style = statusStyles[status] ?? 'bg-muted text-muted-foreground border-border';
  const label = t(status) !== status ? t(status) : status;

  return (
    <span className={`inline-flex items-center border rounded-full font-medium capitalize ${style} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
      {label}
    </span>
  );
}
