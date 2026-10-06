import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Job } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { formatTimeRange } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

interface UpcomingJobsProps {
  jobs: Job[];
  onViewAll?: () => void;
  onSelectJob?: (jobId: string) => void;
  isLoading?: boolean;
}

export const UpcomingJobs: React.FC<UpcomingJobsProps> = ({
  jobs,
  onViewAll,
  onSelectJob,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 hover:shadow-level-2 transition-shadow">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">Upcoming Shifts & Jobs</h3>
            <p className="text-xs text-slate-400">Next scheduled workforce assignments</p>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Upcoming Jobs"
          description="There are currently no scheduled jobs coming up."
        />
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob?.(job.id)}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200/80 bg-slate-50/50 hover:bg-white hover:shadow-level-1 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group border-l-4 border-l-indigo-500"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {job.title}
                  </h4>
                  <PriorityBadge priority={job.priority} size="sm" />
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Assigned to: <span className="font-semibold text-slate-700">{job.assignedToName || 'Unassigned'}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {formatTimeRange(job.startTime, job.endTime)}
                </p>
              </div>

              <div className="shrink-0 flex items-center">
                <StatusBadge status={job.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
