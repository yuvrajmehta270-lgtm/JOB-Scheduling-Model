import React, { useState, useMemo, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobTable } from '../components/jobs/JobTable';
import { JobCard } from '../components/jobs/JobCard';
import { JobForm } from '../components/jobs/JobForm';
import { Button } from '../components/ui/Button';
import { Plus, LayoutGrid, List } from 'lucide-react';
import type { Job } from '../types';
import type { JobFormData } from '../utils/validationSchemas';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { RoleGuard } from '../components/auth/RoleGuard';
import { usePermissions } from '../hooks/usePermissions';

export const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, users, createJob, updateJob, deleteJob, checkConflict } = useAppContext();
  const toast = useToast();
  const { canDeleteJob } = usePermissions();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Auto-open create modal when arriving via ?action=create (from Dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'create') {
      setSelectedJob(null);
      setIsFormOpen(true);
      // Clean the query param from the URL without re-navigating
      navigate('/jobs', { replace: true });
    }
  }, [location.search, navigate]);

  // ─── Filter + Sort ──────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.assignedToName ?? '').toLowerCase().includes(q) ||
          (j.location ?? '').toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((j) => j.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'startTime')   return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (sortBy === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'status')     return a.status.localeCompare(b.status);
      if (sortBy === 'createdAt')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return result;
  }, [jobs, searchQuery, statusFilter, priorityFilter, sortBy]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSubmit = async (data: JobFormData) => {
    try {
      if (selectedJob) {
        await updateJob(selectedJob.id, data);
        toast.success('Job Updated', `"${data.title}" has been updated.`);
      } else {
        await createJob(data);
        toast.success('Job Scheduled', `"${data.title}" created successfully.`);
      }
      setIsFormOpen(false);
      setSelectedJob(null);
    } catch {
      toast.error('Save Failed', 'Could not save the job. Please try again.');
    }
  };

  const handleDelete = async (job: Job) => {
    if (!canDeleteJob) return;
    if (window.confirm(`Delete job "${job.title}"? This cannot be undone.`)) {
      try {
        await deleteJob(job.id);
        toast.info('Job Removed', `"${job.title}" was deleted.`);
      } catch {
        toast.error('Delete Failed', 'Could not delete the job. Please try again.');
      }
    }
  };

  return (
    <PageContainer
      title="Job Management"
      subtitle="Create, schedule, track, and reassign workforce jobs across your organization"
      actions={
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <RoleGuard roles={['admin', 'manager']}>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedJob(null);
                setIsFormOpen(true);
              }}
            >
              Create Job
            </Button>
          </RoleGuard>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters & Controls */}
        <JobFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Result count */}
        <p className="text-xs text-slate-500 -mt-2">
          Showing <span className="font-semibold text-slate-700">{filteredJobs.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{jobs.length}</span> jobs
        </p>

        {/* View Content */}
        {viewMode === 'table' ? (
          <JobTable
            jobs={filteredJobs}
            onSelectJob={(id) => navigate(`/jobs/${id}`)}
            onEditJob={(job) => {
              setSelectedJob(job);
              setIsFormOpen(true);
            }}
            onDeleteJob={handleDelete}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full">
                <JobTable jobs={[]} />
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                    setIsFormOpen(true);
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Create / Edit Form Modal */}
        <JobForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedJob(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedJob}
          users={users}
          checkConflict={checkConflict}
        />
      </div>
    </PageContainer>
  );
};
