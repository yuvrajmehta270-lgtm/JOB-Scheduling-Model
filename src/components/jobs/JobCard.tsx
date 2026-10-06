import React from 'react';
import type { Job } from '../../types';
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { formatTimeRange } from '../../utils/formatters';
import { Calendar, User, MapPin } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 hover:shadow-level-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-0.5 group border-l-4 border-l-indigo-500"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <JobStatusBadge status={job.status} size="sm" />
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{job.description}</p>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">
            <span className="text-slate-400">Assignee:</span>{' '}
            <span className="font-semibold text-slate-800">{job.assignedToName || 'Unassigned'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-mono text-[11px] tabular-nums text-slate-500">
            {formatTimeRange(job.startTime, job.endTime)}
          </span>
        </div>

        {job.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{job.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <JobPriorityBadge priority={job.priority} size="sm" />
        <div className="flex items-center space-x-1.5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
