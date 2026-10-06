import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { JobStatistics } from '../components/dashboard/JobStatistics';
import { Calendar, Download, BarChart2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

type DateRange = 'today' | 'this_week' | 'this_month';

function getRangeStart(range: DateRange): Date {
  const now = new Date();
  if (range === 'today') {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (range === 'this_week') {
    const day = now.getDay(); // 0 = Sunday
    now.setDate(now.getDate() - day);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  // this_month
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
}

export const Reports: React.FC = () => {
  const { jobs } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange>('this_month');

  const rangeJobs = useMemo(() => {
    const start = getRangeStart(dateRange);
    return jobs.filter((j) => new Date(j.createdAt) >= start);
  }, [jobs, dateRange]);

  const completionRate = useMemo(() => {
    const eligible = rangeJobs.filter((j) => j.status !== 'cancelled').length;
    const completed = rangeJobs.filter((j) => j.status === 'completed').length;
    return eligible > 0 ? Math.round((completed / eligible) * 100) : 0;
  }, [rangeJobs]);

  const avgDurationHours = useMemo(() => {
    const completedJobs = rangeJobs.filter((j) => j.status === 'completed');
    if (!completedJobs.length) return 0;
    const totalMs = completedJobs.reduce((sum, j) => {
      return sum + (new Date(j.endTime).getTime() - new Date(j.startTime).getTime());
    }, 0);
    return (totalMs / completedJobs.length / 3600000).toFixed(1);
  }, [rangeJobs]);

  const overdueCount = useMemo(
    () => rangeJobs.filter((j) => j.status === 'overdue').length,
    [rangeJobs],
  );

  const statusData = useMemo(() => [
    { name: 'Pending',     value: rangeJobs.filter(j => j.status === 'pending').length,     color: '#F59E0B' },
    { name: 'Scheduled',  value: rangeJobs.filter(j => j.status === 'scheduled').length,   color: '#3B82F6' },
    { name: 'In Progress',value: rangeJobs.filter(j => j.status === 'in_progress').length, color: '#0EA5E9' },
    { name: 'Completed',  value: rangeJobs.filter(j => j.status === 'completed').length,   color: '#10B981' },
    { name: 'Overdue',    value: rangeJobs.filter(j => j.status === 'overdue').length,     color: '#F43F5E' },
    { name: 'Cancelled',  value: rangeJobs.filter(j => j.status === 'cancelled').length,   color: '#94A3B8' },
  ], [rangeJobs]);

  const priorityData = useMemo(() => [
    { name: 'Low',      count: rangeJobs.filter(j => j.priority === 'low').length,      color: '#94A3B8' },
    { name: 'Medium',   count: rangeJobs.filter(j => j.priority === 'medium').length,   color: '#4F46E5' },
    { name: 'High',     count: rangeJobs.filter(j => j.priority === 'high').length,     color: '#F59E0B' },
    { name: 'Critical', count: rangeJobs.filter(j => j.priority === 'critical').length, color: '#F43F5E' },
  ], [rangeJobs]);

  const handleExport = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Start', 'End', 'Location'];
    const rows = rangeJobs.map((j) => [
      j.id, j.title, j.status, j.priority,
      j.assignedToName ?? 'Unassigned',
      j.startTime, j.endTime,
      j.location ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobflow-report-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Reports & Analytics"
      subtitle="Operational performance metrics, SLA completion rates, and workload analytics"
      actions={
        <div className="flex items-center space-x-3">
          {/* Quick Date Range Filter */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200/90 p-1 rounded-xl text-xs font-medium shadow-level-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(['today', 'this_week', 'this_month'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  dateRange === r ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'this_week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summaries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Job Volume"
            value={String(rangeJobs.length)}
            icon={<BarChart2 className="w-5 h-5" />}
            iconBgColor="bg-slate-100 text-slate-700"
            subtitle="Created in period"
          />
          <StatCard
            title="Completion SLA"
            value={`${completionRate}%`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
            subtitle="Target ≥ 92%"
          />
          <StatCard
            title="Avg Work Duration"
            value={`${avgDurationHours}h`}
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600"
            subtitle="Per completed job"
          />
          <StatCard
            title="Overdue Tasks"
            value={String(overdueCount)}
            icon={<AlertCircle className="w-5 h-5" />}
            iconBgColor="bg-rose-50 text-rose-600"
            subtitle="Missed SLA deadline"
          />
        </div>

        {/* Recharts Analytics Widgets — scoped to date range */}
        <JobStatistics statusData={statusData} priorityData={priorityData} />
      </div>
    </PageContainer>
  );
};
