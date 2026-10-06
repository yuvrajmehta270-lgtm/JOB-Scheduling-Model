import React from 'react';
import { Activity, Clock } from 'lucide-react';
import type { ActivityLog } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface RecentActivityProps {
  activities: ActivityLog[];
  isLoading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 hover:shadow-level-2 transition-shadow">
      <div className="flex items-center space-x-2.5 pb-3.5 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold font-display text-slate-900">Recent Activity Timeline</h3>
          <p className="text-xs text-slate-400">Live operational event log</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          title="No Recent Activity"
          description="System events and updates will be streamed here in real time."
        />
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-slate-100">
          {activities.map((log) => (
            <div key={log.id} className="relative flex items-start space-x-3 text-sm pl-1 group">
              <div className="w-3.5 h-3.5 mt-1 rounded-full bg-indigo-600 border-2 border-white shadow-xs shrink-0 z-10 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs text-slate-800 leading-snug">
                  <span className="font-bold text-slate-900">{log.performedByName}</span>{' '}
                  <span className="text-slate-600">{log.details}</span>
                </p>
                <div className="flex items-center space-x-1.5 mt-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
