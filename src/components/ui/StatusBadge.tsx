import React from 'react';
import type { JobStatus } from '../../types';
import { formatStatusLabel } from '../../utils/formatters';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<
    JobStatus,
    { bg: string; text: string; dot: string; border: string; ping?: boolean; strike?: boolean }
  > = {
    pending: {
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#B45309]',
      dot: 'bg-[#F59E0B]',
      border: 'border-[#FDE68A]',
    },
    scheduled: {
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#1D4ED8]',
      dot: 'bg-[#3B82F6]',
      border: 'border-[#BFDBFE]',
    },
    in_progress: {
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#0369A1]',
      dot: 'bg-[#0EA5E9]',
      border: 'border-[#BAE6FD]',
      ping: true,
    },
    completed: {
      bg: 'bg-[#D1FAE5]',
      text: 'text-[#047857]',
      dot: 'bg-[#10B981]',
      border: 'border-[#A7F3D0]',
    },
    overdue: {
      bg: 'bg-[#FFE4E6]',
      text: 'text-[#BE123C]',
      dot: 'bg-[#F43F5E]',
      border: 'border-[#FECDD3]',
    },
    cancelled: {
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#64748B]',
      dot: 'bg-[#94A3B8]',
      border: 'border-[#E2E8F0]',
      strike: true,
    },
  };

  const item = config[status] || config.pending;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]} ${
        item.strike ? 'line-through opacity-80' : ''
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {item.ping && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${item.dot}`} />
      </span>
      <span>{formatStatusLabel(status)}</span>
    </span>
  );
};
