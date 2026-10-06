import React from 'react';
import type { Job } from '../../types';
import { JobStatusBadge } from './JobStatusBadge';
import { JobPriorityBadge } from './JobPriorityBadge';
import { formatDateTime } from '../../utils/formatters';
import { Calendar, User, MapPin, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface JobDetailsProps {
  job: Job | null;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (newStatus: Job['status']) => void;
  isLoading?: boolean;
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
}) => {
  if (isLoading || !job) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/3" />
        <div className="h-24 bg-slate-100 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Jobs
        </button>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" icon={<Edit className="w-3.5 h-3.5" />} onClick={onEdit}>
              Edit Job
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onDelete}>
              Delete Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-level-1 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Job #{job.id.slice(-6).toUpperCase()}
                </span>
                <h2 className="text-2xl font-bold font-display text-slate-900 leading-tight mt-2">{job.title}</h2>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <JobPriorityBadge priority={job.priority} />
                <JobStatusBadge status={job.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description & Job Scope
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                {job.description}
              </p>
            </div>

            {onStatusChange && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Transition Status Workflow:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onStatusChange('scheduled')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:brightness-95 transition-all shadow-xs"
                  >
                    Mark Scheduled
                  </button>
                  <button
                    onClick={() => onStatusChange('in_progress')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1] hover:brightness-95 transition-all shadow-xs"
                  >
                    Start (In Progress)
                  </button>
                  <button
                    onClick={() => onStatusChange('completed')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#A7F3D0] bg-[#D1FAE5] text-[#047857] hover:brightness-95 transition-all shadow-xs"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => onStatusChange('cancelled')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all shadow-xs"
                  >
                    Cancel Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 font-display uppercase tracking-wider text-[11px] pb-2.5 border-b border-slate-100">
              Schedule & Assignment
            </h4>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-400 font-medium">Assigned Worker</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{job.assignedToName || 'Unassigned'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-400 font-medium">Scheduled Window</p>
                <p className="font-bold text-slate-900 mt-0.5 tabular-nums font-mono">{formatDateTime(job.startTime)}</p>
                <p className="text-slate-500 tabular-nums font-mono">to {formatDateTime(job.endTime)}</p>
              </div>
            </div>

            {job.location && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Job Location</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{job.location}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-400 font-mono tabular-nums">
              <p>Created by: {job.createdByName} on {formatDateTime(job.createdAt)}</p>
              <p>Last modified: {formatDateTime(job.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
