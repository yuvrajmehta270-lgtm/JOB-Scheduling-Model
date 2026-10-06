import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { JobDetails } from '../components/jobs/JobDetails';
import { JobForm } from '../components/jobs/JobForm';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, updateJobStatus, deleteJob, users, checkConflict } = useAppContext();
  const toast = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const job = jobId ? getJobById(jobId) : undefined;

  const handleDelete = () => {
    if (!job) return;
    if (window.confirm(`Permanently delete "${job.title}"? This cannot be undone.`)) {
      deleteJob(job.id);
      toast.info('Job Removed', `"${job.title}" has been deleted.`);
      navigate('/jobs');
    }
  };

  return (
    <PageContainer title="Job Details">
      <JobDetails
        job={job ?? null}
        isLoading={!job && Boolean(jobId)}
        onBack={() => navigate('/jobs')}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
        onStatusChange={(status) => {
          if (job) {
            updateJobStatus(job.id, status);
            toast.success('Status Updated', `Job marked as ${status.replace('_', ' ')}.`);
          }
        }}
      />

      {/* Edit modal */}
      {job && (
        <JobForm
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={(data) => {
            updateJob(job.id, data);
            toast.success('Job Updated', `"${data.title}" updated.`);
            setIsEditOpen(false);
          }}
          initialData={job}
          users={users}
          checkConflict={checkConflict}
        />
      )}
    </PageContainer>
  );
};
