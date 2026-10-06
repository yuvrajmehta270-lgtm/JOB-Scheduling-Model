import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { JobCalendar } from '../components/calendar/JobCalendar';
import { JobForm } from '../components/jobs/JobForm';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import type { JobFormData } from '../utils/validationSchemas';

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, users, createJob, rescheduleJob, checkConflict } = useAppContext();
  const toast = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  // Pre-fill date-time when user clicks a calendar date slot
  const [prefilledTimes, setPrefilledTimes] = useState<{ start: string; end: string } | null>(null);

  const handleDateSelect = (start: string, end: string) => {
    setPrefilledTimes({ start, end });
    setIsFormOpen(true);
  };

  const handleCreateJob = (data: JobFormData) => {
    createJob(data);
    toast.success('Job Scheduled', `"${data.title}" added to calendar.`);
    setIsFormOpen(false);
    setPrefilledTimes(null);
  };

  const handleEventDrop = (jobId: string, newStart: string, newEnd: string) => {
    rescheduleJob(jobId, newStart, newEnd);
    toast.info('Job Rescheduled', `Shift timing updated on calendar.`);
  };

  return (
    <PageContainer
      title="Schedule Calendar"
      subtitle="Interactive multi-view calendar (Month, Week, Day, Agenda) — click a date to create, drag to reschedule"
    >
      <JobCalendar
        jobs={jobs}
        onSelectJob={(id) => navigate(`/jobs/${id}`)}
        onDateSelect={handleDateSelect}
        onEventDrop={handleEventDrop}
      />

      {/* Quick-create job from calendar date selection */}
      <JobForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPrefilledTimes(null);
        }}
        onSubmit={handleCreateJob}
        initialData={
          prefilledTimes
            ? ({
                title: '',
                description: '',
                assignedTo: null,
                priority: 'medium',
                status: 'scheduled',
                startTime: prefilledTimes.start.slice(0, 16),
                endTime: prefilledTimes.end.slice(0, 16),
                location: '',
                notes: '',
              } as any)
            : null
        }
        users={users}
        checkConflict={checkConflict}
      />
    </PageContainer>
  );
};
