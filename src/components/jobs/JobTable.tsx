import React from 'react';
import type { Job } from '../../types';
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { formatTimeRange } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface JobTableProps {
  jobs: Job[];
  isLoading?: boolean;
  onSelectJob?: (jobId: string) => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  isLoading = false,
  onSelectJob,
  onEditJob,
  onDeleteJob,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Jobs Found"
        description="There are no jobs matching your current search or filter criteria."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-level-1 overflow-hidden hover:shadow-level-2 transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-display">Job Title & Description</th>
              <th className="py-3.5 px-4 font-display">Priority</th>
              <th className="py-3.5 px-4 font-display">Status</th>
              <th className="py-3.5 px-4 font-display">Assignee</th>
              <th className="py-3.5 px-4 font-display">Schedule Time</th>
              <th className="py-3.5 px-4 text-right font-display">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                onClick={() => onSelectJob?.(job.id)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{job.description}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <JobPriorityBadge priority={job.priority} size="sm" />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <JobStatusBadge status={job.status} size="sm" />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                  {job.assignedToName ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center justify-center">
                        {job.assignedToName.charAt(0).toUpperCase()}
                      </span>
                      <span>{job.assignedToName}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-mono tabular-nums">
                  {formatTimeRange(job.startTime, job.endTime)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onSelectJob?.(job.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEditJob && (
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Job"
                        aria-label="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteJob && (
                      <button
                        onClick={() => onDeleteJob(job)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Job"
                        aria-label="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
