import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DashboardMetrics } from '../../types';

interface JobStatisticsProps {
  metrics?: DashboardMetrics;
  statusData?: { name: string; value: number; color: string }[];
  priorityData?: { name: string; count: number; color: string }[];
  isLoading?: boolean;
}

export const JobStatistics: React.FC<JobStatisticsProps> = ({
  statusData = [],
  priorityData = [],
  isLoading = false,
}) => {
  const defaultStatusData = [
    { name: 'Pending', value: 0, color: '#64748b' },
    { name: 'Scheduled', value: 0, color: '#3b82f6' },
    { name: 'In Progress', value: 0, color: '#f59e0b' },
    { name: 'Completed', value: 0, color: '#10b981' },
    { name: 'Overdue', value: 0, color: '#ef4444' },
  ];

  const defaultPriorityData = [
    { name: 'Low', count: 0, color: '#94a3b8' },
    { name: 'Medium', count: 0, color: '#6366f1' },
    { name: 'High', count: 0, color: '#f59e0b' },
    { name: 'Critical', count: 0, color: '#ef4444' },
  ];

  const activeStatusData = statusData.length > 0 ? statusData : defaultStatusData;
  const activePriorityData = priorityData.length > 0 ? priorityData : defaultPriorityData;

  const hasStatusData = activeStatusData.some((d) => d.value > 0);
  const hasPriorityData = activePriorityData.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Jobs by Status Pie Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 flex flex-col hover:shadow-level-2 transition-shadow">
        <h3 className="text-base font-bold font-display text-slate-900 mb-0.5">Jobs Breakdown by Status</h3>
        <p className="text-xs text-slate-500 mb-4">Distribution of job states across the platform</p>

        {isLoading ? (
          <div className="h-56 bg-slate-100 animate-pulse rounded-xl flex-1" />
        ) : !hasStatusData ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">No Job Status Data Available</p>
            <p className="text-xs text-slate-400 mt-1">Status distributions will display here once jobs are created.</p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {activeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Jobs by Priority Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 flex flex-col hover:shadow-level-2 transition-shadow">
        <h3 className="text-base font-bold font-display text-slate-900 mb-0.5">Jobs Breakdown by Priority</h3>
        <p className="text-xs text-slate-500 mb-4">Workload priority allocation and severity distribution</p>

        {isLoading ? (
          <div className="h-56 bg-slate-100 animate-pulse rounded-xl flex-1" />
        ) : !hasPriorityData ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">No Priority Data Available</p>
            <p className="text-xs text-slate-400 mt-1">Priority levels will display here once jobs are created.</p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activePriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {activePriorityData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
