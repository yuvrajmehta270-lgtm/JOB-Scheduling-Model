import React from 'react';
import type { JobPriority } from '../../types';
import { formatPriorityLabel } from '../../utils/formatters';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: JobPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config: Record<JobPriority, { style: string; icon: React.ReactNode }> = {
    low: {
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <ArrowDown className="w-3 h-3 text-slate-500" />,
    },
    medium: {
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <ArrowUp className="w-3 h-3 text-indigo-500" />,
    },
    high: {
      style: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
    },
    critical: {
      style: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px] gap-1' : 'px-3 py-1 text-xs font-semibold gap-1.5';
  const item = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${item.style} ${sizeClasses}`}>
      {item.icon}
      <span>{formatPriorityLabel(priority)}</span>
    </span>
  );
};
