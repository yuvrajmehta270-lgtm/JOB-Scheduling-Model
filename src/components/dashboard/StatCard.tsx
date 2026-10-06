import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBgColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600',
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 hover:shadow-level-2 transition-all group">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">{title}</span>
        {/* 48px square tinted icon container with rounded-xl */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        {/* metric-display: Plus Jakarta Sans, 32px (2rem), 800 weight, tabular-nums */}
        <div className="text-3xl font-extrabold font-display text-slate-900 tracking-tight tabular-nums">
          {value}
        </div>
        {change && (
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : changeType === 'negative'
                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};
