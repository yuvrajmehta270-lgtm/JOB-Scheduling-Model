import React, { useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { UpcomingJobs } from '../components/dashboard/UpcomingJobs';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { JobStatistics } from '../components/dashboard/JobStatistics';
import { Briefcase, CalendarCheck, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { RoleGuard } from '../components/auth/RoleGuard';
import { Button } from '../components/ui/Button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, upcomingJobs, recentActivity, jobs } = useAppContext();

  // Build chart data from live jobs
  const statusData = useMemo(() => [
    { name: 'Pending',     value: jobs.filter(j => j.status === 'pending').length,     color: '#F59E0B' },
    { name: 'Scheduled',  value: jobs.filter(j => j.status === 'scheduled').length,   color: '#3B82F6' },
    { name: 'In Progress',value: jobs.filter(j => j.status === 'in_progress').length, color: '#0EA5E9' },
    { name: 'Completed',  value: jobs.filter(j => j.status === 'completed').length,   color: '#10B981' },
    { name: 'Overdue',    value: jobs.filter(j => j.status === 'overdue').length,     color: '#F43F5E' },
    { name: 'Cancelled',  value: jobs.filter(j => j.status === 'cancelled').length,   color: '#94A3B8' },
  ], [jobs]);

  const priorityData = useMemo(() => [
    { name: 'Low',      count: jobs.filter(j => j.priority === 'low').length,      color: '#94A3B8' },
    { name: 'Medium',   count: jobs.filter(j => j.priority === 'medium').length,   color: '#4F46E5' },
    { name: 'High',     count: jobs.filter(j => j.priority === 'high').length,     color: '#F59E0B' },
    { name: 'Critical', count: jobs.filter(j => j.priority === 'critical').length, color: '#F43F5E' },
  ], [jobs]);

  return (
    <PageContainer
      title="Dashboard Overview"
      subtitle="Real-time operational KPIs, job completion metrics, and workforce schedule feed"
      actions={
        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<CalendarIcon className="w-4 h-4" />}
            onClick={() => navigate('/calendar')}
          >
            Calendar
          </Button>
          <RoleGuard roles={['admin', 'manager']}>
            <Button
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/jobs?action=create')}
            >
              Create Job
            </Button>
          </RoleGuard>
        </div>
      }
    >
      <div className="space-y-5">
        {/* KPI Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Total Jobs"
            value={String(metrics.totalJobs)}
            icon={<Briefcase className="w-5 h-5" />}
            iconBgColor="bg-slate-100 text-slate-700"
            subtitle="Registered tasks"
          />
          <StatCard
            title="Scheduled"
            value={String(metrics.scheduledJobs)}
            icon={<CalendarCheck className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600"
            subtitle="Confirmed schedule"
          />
          <StatCard
            title="In Progress"
            value={String(metrics.inProgressJobs)}
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600"
            subtitle="Active field work"
          />
          <StatCard
            title="Completed"
            value={String(metrics.completedJobs)}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
            subtitle="Finished jobs"
          />
          <StatCard
            title="Overdue"
            value={String(metrics.overdueJobs)}
            icon={<AlertCircle className="w-5 h-5" />}
            iconBgColor="bg-rose-50 text-rose-600"
            subtitle="Missed deadline"
          />
          <StatCard
            title="Cancelled"
            value={String(metrics.cancelledJobs)}
            icon={<XCircle className="w-5 h-5" />}
            iconBgColor="bg-slate-100 text-slate-500"
            subtitle="Voided requests"
          />
        </div>

        {/* Data Visualization Charts Section */}
        <JobStatistics statusData={statusData} priorityData={priorityData} />

        {/* Operational Feeds: Upcoming Jobs & Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <UpcomingJobs
              jobs={upcomingJobs}
              onViewAll={() => navigate('/jobs')}
              onSelectJob={(id) => navigate(`/jobs/${id}`)}
            />
          </div>
          <div>
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
