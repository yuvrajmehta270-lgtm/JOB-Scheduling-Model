import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, type JobFormData } from '../../utils/validationSchemas';
import type { Job, UserProfile } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { ConflictCheckResult } from '../../utils/conflictDetector';
import { AlertTriangle } from 'lucide-react';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => void;
  initialData?: Job | null | Partial<JobFormData>;
  users?: UserProfile[];
  isLoading?: boolean;
  checkConflict?: (start: string, end: string, assigneeUid: string | null, ignoreJobId?: string) => ConflictCheckResult;
}

function isJob(data: Job | Partial<JobFormData>): data is Job {
  return typeof (data as Job).id === 'string';
}

export const JobForm: React.FC<JobFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  users = [],
  isLoading = false,
  checkConflict,
}) => {
  const isEditing = Boolean(initialData && isJob(initialData as any));
  const jobId = isEditing ? (initialData as Job).id : undefined;

  const defaultValues: JobFormData = {
    title: (initialData as any)?.title || '',
    description: (initialData as any)?.description || '',
    assignedTo: (initialData as any)?.assignedTo || null,
    priority: (initialData as any)?.priority || 'medium',
    status: (initialData as any)?.status || 'pending',
    startTime: (initialData as any)?.startTime
      ? (initialData as any).startTime.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endTime: (initialData as any)?.endTime
      ? (initialData as any).endTime.slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: (initialData as any)?.location || '',
    notes: (initialData as any)?.notes || '',
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setConflict(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // ─── Live Conflict Check ─────────────────────────────────────────────────
  const [conflict, setConflict] = useState<ConflictCheckResult | null>(null);
  const watchedStart = watch('startTime');
  const watchedEnd = watch('endTime');
  const watchedAssignee = watch('assignedTo');

  useEffect(() => {
    if (!checkConflict || !watchedStart || !watchedEnd) return;
    const result = checkConflict(watchedStart, watchedEnd, watchedAssignee || null, jobId);
    setConflict(result);
  }, [watchedStart, watchedEnd, watchedAssignee, checkConflict, jobId]);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({ value: u.uid, label: `${u.displayName} (${u.role})` })),
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Record' : 'Create New Job'}
      subtitle={isEditing ? 'Update job scheduling and details' : 'Fill in required fields to schedule a new job'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Job Title"
          placeholder="e.g. HVAC Maintenance Check"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="w-full space-y-1">
          <label className="block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows={3}
            placeholder="Detailed job scope, tasks to perform, and customer details..."
            className={`w-full rounded-lg border text-sm p-3 focus:outline-none focus:ring-2 shadow-level-1 transition-all ${
              errors.description
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20 bg-white'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned Employee"
            options={assigneeOptions}
            error={errors.assignedTo?.message}
            {...register('assignedTo')}
          />
          <Select
            label="Priority Level"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="End Date & Time"
            type="datetime-local"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
          <Select
            label="Job Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        {/* ─── Conflict Warning Banner ─────────────────────────────────── */}
        {conflict?.hasConflict && (
          <div className="flex items-start gap-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm shadow-level-1 animate-fadeIn">
            <div className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 font-display">Schedule Conflict Detected</p>
              <p className="text-xs text-amber-800 mt-0.5">
                This employee already has{' '}
                <span className="font-bold underline">{conflict.conflictingJobs.length}</span> overlapping shift
                {conflict.conflictingJobs.length > 1 ? 's' : ''}:
              </p>
              <ul className="mt-2 space-y-1">
                {conflict.conflictingJobs.map((j) => (
                  <li key={j.id} className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-amber-950">{j.title}</span>
                    <span className="font-mono text-[11px] tabular-nums text-amber-700">
                      ({new Date(j.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(j.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 mt-2 italic">
                You can proceed with saving if this double-booking is deliberate.
              </p>
            </div>
          </div>
        )}

        <Input
          label="Job Location (Optional)"
          placeholder="e.g. Building B, Room 402"
          error={errors.location?.message}
          {...register('location')}
        />

        <div className="w-full space-y-1">
          <label className="block text-xs font-semibold text-slate-700">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Internal notes, special instructions, safety requirements..."
            className="w-full rounded-lg border border-slate-200 text-sm p-3 focus:outline-none focus:ring-2 focus:border-indigo-600 focus:ring-indigo-500/20 bg-white shadow-level-1 transition-all"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            variant={conflict?.hasConflict ? 'danger' : 'primary'}
          >
            {conflict?.hasConflict
              ? isEditing ? 'Save (Conflict Warning)' : 'Create (Conflict Warning)'
              : isEditing ? 'Save Changes' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
