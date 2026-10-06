import type { JobPriority, JobStatus } from '../types';

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTimeRange(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return '';
  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  const timeFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${formatDate(startIso)} • ${timeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }

  return `${formatDateTime(startIso)} – ${formatDateTime(endIso)}`;
}

export function formatStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
  };
  return labels[status] || status;
}

export function formatPriorityLabel(priority: JobPriority): string {
  const labels: Record<JobPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[priority] || priority;
}
