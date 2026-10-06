import type { Job } from '../types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingJobs: Job[];
}

export function checkScheduleConflict(
  candidateStart: string,
  candidateEnd: string,
  assignedToUid: string | null,
  allJobs: Job[],
  ignoreJobId?: string
): ConflictCheckResult {
  if (!assignedToUid) {
    return { hasConflict: false, conflictingJobs: [] };
  }

  const candidateStartMs = new Date(candidateStart).getTime();
  const candidateEndMs = new Date(candidateEnd).getTime();

  if (isNaN(candidateStartMs) || isNaN(candidateEndMs) || candidateStartMs >= candidateEndMs) {
    return { hasConflict: false, conflictingJobs: [] };
  }

  const activeStatuses = new Set(['scheduled', 'in_progress', 'pending']);

  const conflictingJobs = allJobs.filter((job) => {
    if (job.id === ignoreJobId) return false;
    if (job.assignedTo !== assignedToUid) return false;
    if (!activeStatuses.has(job.status)) return false;

    const existingStartMs = new Date(job.startTime).getTime();
    const existingEndMs = new Date(job.endTime).getTime();

    const isOverlapping = candidateStartMs < existingEndMs && candidateEndMs > existingStartMs;

    return isOverlapping;
  });

  return {
    hasConflict: conflictingJobs.length > 0,
    conflictingJobs,
  };
}
